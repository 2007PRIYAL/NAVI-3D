/**
 * AegisIndoor 3D A* Spatial Pathfinding Engine
 * Dual-Mode Navigation: Standard (direct/stairs) vs Accessible (wheelchair/ramp/clearance)
 */

export const DEFAULT_BOUNDS = {
  minX: -14.0,
  maxX: 14.0,
  minZ: -11.5,
  maxZ: 11.5,
};

/**
 * Calculates adaptive dataset bounding box from POI array and room limits
 */
export function calculateDatasetBounds(pois = [], explicitBounds = null) {
  if (explicitBounds && explicitBounds.minX !== undefined) {
    return { ...explicitBounds };
  }
  if (!pois || pois.length === 0) return { ...DEFAULT_BOUNDS };

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  pois.forEach((poi) => {
    if (poi.position && poi.position.length >= 3) {
      const [px, , pz] = poi.position;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }
  });

  if (!isFinite(minX)) return { ...DEFAULT_BOUNDS };

  const margin = 2.0;
  return {
    minX: Math.floor((minX - margin) * 2) / 2,
    maxX: Math.ceil((maxX + margin) * 2) / 2,
    minZ: Math.floor((minZ - margin) * 2) / 2,
    maxZ: Math.ceil((maxZ + margin) * 2) / 2,
  };
}

const CELL_SIZE = 0.4; // 40cm resolution per cell
const MIN_X = DEFAULT_BOUNDS.minX;
const MAX_X = DEFAULT_BOUNDS.maxX;
const MIN_Z = DEFAULT_BOUNDS.minZ;
const MAX_Z = DEFAULT_BOUNDS.maxZ;

const GRID_WIDTH = Math.round((MAX_X - MIN_X) / CELL_SIZE);
const GRID_HEIGHT = Math.round((MAX_Z - MIN_Z) / CELL_SIZE);

// Room architectural zones (columns flanking corridors, avoiding ramp zone at x=6, z=0)
const COLUMNS = [
  { x: -6, z: -8, r: 0.35 },
  { x: -6, z: 0, r: 0.35 },
  { x: -6, z: 8, r: 0.35 },
  { x: 6, z: -8, r: 0.35 },
  { x: 6, z: 8, r: 0.35 },
];

export const DECK_BOUNDS = { minX: 3.0, maxX: 9.0, minZ: -9.0, maxZ: -1.0, height: 0.65 };
export const RAMP_BOUNDS = { minX: 4.8, maxX: 7.2, minZ: -1.0, maxZ: 3.2 };
export const STAIRS_BOUNDS = { minX: 3.0, maxX: 4.6, minZ: -1.15, maxZ: -0.1 };

// Multi-Level Inter-Floor Vertical Connectors
export const VERTICAL_CONNECTORS = [
  {
    id: 'elevator',
    name: 'Braille Elevator Alpha',
    shortName: 'Elevator',
    x: -6.0,
    z: -6.0,
    accessible: true,
    description: 'Enclosed braille elevator serving Levels 0, 1, and 2',
  },
  {
    id: 'stairs',
    name: 'Inter-Floor Stairwell',
    shortName: 'Stairs',
    x: 3.8,
    z: -0.65,
    accessible: false,
    description: 'Central stairwell flight connecting Levels 0, 1, and 2',
  },
];

/**
 * Converts world (x, z) to grid coordinates (gx, gz)
 */
export function worldToGrid(x, z, bounds = DEFAULT_BOUNDS) {
  const minX = bounds.minX ?? MIN_X;
  const minZ = bounds.minZ ?? MIN_Z;
  const maxX = bounds.maxX ?? MAX_X;
  const maxZ = bounds.maxZ ?? MAX_Z;
  const gridWidth = Math.round((maxX - minX) / CELL_SIZE);
  const gridHeight = Math.round((maxZ - minZ) / CELL_SIZE);

  const gx = Math.floor((x - minX) / CELL_SIZE);
  const gz = Math.floor((z - minZ) / CELL_SIZE);
  return {
    gx: Math.max(0, Math.min(gridWidth - 1, gx)),
    gz: Math.max(0, Math.min(gridHeight - 1, gz)),
  };
}

/**
 * Converts grid coordinates (gx, gz) to world (x, z)
 */
export function gridToWorld(gx, gz, bounds = DEFAULT_BOUNDS) {
  const minX = bounds.minX ?? MIN_X;
  const minZ = bounds.minZ ?? MIN_Z;
  return {
    x: minX + (gx + 0.5) * CELL_SIZE,
    z: minZ + (gz + 0.5) * CELL_SIZE,
  };
}

/**
 * Evaluates whether a world coordinate is walkable under the given profile and floor level
 * Profile: 'accessible' (wheelchair) | 'standard' (direct)
 * Floor: 0 (Ground), 1 (Mezzanine), 2 (Terrace)
 */
export function isCellWalkable(wx, wz, profile = 'accessible', bounds = DEFAULT_BOUNDS, floor = 0) {
  const isWheelchair = profile === 'accessible' || profile === 'wheelchair';
  const clearancePadding = isWheelchair ? 0.75 : 0.3; // Obstacle buffer for wheelchair width

  const minX = bounds.minX ?? MIN_X;
  const maxX = bounds.maxX ?? MAX_X;
  const minZ = bounds.minZ ?? MIN_Z;
  const maxZ = bounds.maxZ ?? MAX_Z;

  // 1. Room perimeter boundary check
  if (
    wx < minX + clearancePadding ||
    wx > maxX - clearancePadding ||
    wz < minZ + clearancePadding ||
    wz > maxZ - clearancePadding
  ) {
    return false;
  }

  // 2. Multi-Storey Level Specific Obstacle Checks
  const isShowroom = maxX > 9;
  if (isShowroom) {
    // Level 1 (Mezzanine): Central Atrium Void opening (unwalkable hole looking down to L0)
    if (floor === 1) {
      const inAtriumVoid = wx >= -3.2 && wx <= 3.2 && wz >= -3.2 && wz <= 3.2;
      if (inAtriumVoid) {
        return false;
      }
    }

    // Level 0: Ground Floor specific columns & deck features
    if (floor === 0) {
      for (const col of COLUMNS) {
        const dist = Math.hypot(wx - col.x, wz - col.z);
        if (dist < col.r + clearancePadding) {
          return false;
        }
      }

      // Elevated Platform Deck & Access Transitions
      const inDeck =
        wx >= DECK_BOUNDS.minX &&
        wx <= DECK_BOUNDS.maxX &&
        wz >= DECK_BOUNDS.minZ &&
        wz <= DECK_BOUNDS.maxZ;

      // Ramp side curb & handrail barriers
      const isRampSideRail =
        ((wx >= 4.5 && wx <= 4.85) || (wx >= 7.15 && wx <= 7.5)) &&
        (wz >= -0.95 && wz <= 2.8);
      if (isRampSideRail) {
        return false;
      }

      const inRamp =
        wx >= RAMP_BOUNDS.minX &&
        wx <= RAMP_BOUNDS.maxX &&
        wz >= RAMP_BOUNDS.minZ &&
        wz <= RAMP_BOUNDS.maxZ;

      const inStairs =
        wx >= STAIRS_BOUNDS.minX &&
        wx <= STAIRS_BOUNDS.maxX &&
        wz >= STAIRS_BOUNDS.minZ &&
        wz <= STAIRS_BOUNDS.maxZ;

      // Wheelchair strictly cannot use stairs
      if (isWheelchair && inStairs) {
        return false;
      }

      // Crossing from floor into deck:
      const isDeckPerimeter =
        wx >= DECK_BOUNDS.minX - 0.4 &&
        wx <= DECK_BOUNDS.maxX + 0.4 &&
        wz >= DECK_BOUNDS.minZ - 0.4 &&
        wz <= DECK_BOUNDS.maxZ + 0.4;

      if (isDeckPerimeter && !inDeck && !inRamp) {
        if (inStairs && !isWheelchair) {
          return true; // standard walk can step up
        }
        return false;
      }
    }
  }

  return true;
}

/**
 * Computes height Y along the path for a specific floor level
 */
export function getElevationY(wx, wz, bounds = DEFAULT_BOUNDS, floor = 0) {
  const baseFloorY = floor * 4.0;

  // If compact dataset room or upper floor, maintain flat floor elevation on that level
  if (floor > 0 || (bounds && bounds.maxX <= 9)) {
    return Number((baseFloorY + 0.05).toFixed(2));
  }

  // Level 0: Check if on elevated deck
  if (
    wx >= DECK_BOUNDS.minX &&
    wx <= DECK_BOUNDS.maxX &&
    wz >= DECK_BOUNDS.minZ &&
    wz <= DECK_BOUNDS.maxZ
  ) {
    return DECK_BOUNDS.height;
  }

  // Level 0: Check if on ramp: slope from z = 3.2 (y = 0.05) to z = -1.0 (y = 0.65)
  if (
    wx >= RAMP_BOUNDS.minX &&
    wx <= RAMP_BOUNDS.maxX &&
    wz >= RAMP_BOUNDS.minZ &&
    wz <= RAMP_BOUNDS.maxZ
  ) {
    const t = (3.2 - wz) / (3.2 - -1.0);
    const clampedT = Math.max(0, Math.min(1, t));
    return Number((0.05 + clampedT * (DECK_BOUNDS.height - 0.05)).toFixed(2));
  }

  // Level 0: Check if on direct stairs
  if (
    wx >= STAIRS_BOUNDS.minX &&
    wx <= STAIRS_BOUNDS.maxX &&
    wz >= STAIRS_BOUNDS.minZ &&
    wz <= STAIRS_BOUNDS.maxZ
  ) {
    if (wz > -0.48) return 0.20;
    if (wz > -0.83) return 0.40;
    return 0.60;
  }

  return 0.05;
}

/**
 * Min-Heap Priority Queue for A* search
 */
class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  push(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  pop() {
    return this.elements.shift()?.item;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Single-Floor A* Pathfinding Engine
 */
export function findSingleFloorPath(startPos, targetPos, profile = 'accessible', customBounds = DEFAULT_BOUNDS, floor = 0) {
  const bounds = customBounds || DEFAULT_BOUNDS;
  const gridWidth = Math.round(((bounds.maxX ?? MAX_X) - (bounds.minX ?? MIN_X)) / CELL_SIZE);
  const gridHeight = Math.round(((bounds.maxZ ?? MAX_Z) - (bounds.minZ ?? MIN_Z)) / CELL_SIZE);

  const startGrid = worldToGrid(startPos.x, startPos.z, bounds);
  const targetGrid = worldToGrid(targetPos.x, targetPos.z, bounds);

  let startNodeKey = `${startGrid.gx},${startGrid.gz}`;
  let targetNodeKey = `${targetGrid.gx},${targetGrid.gz}`;

  const frontier = new PriorityQueue();
  frontier.push(startNodeKey, 0);

  const cameFrom = new Map();
  const costSoFar = new Map();

  cameFrom.set(startNodeKey, null);
  costSoFar.set(startNodeKey, 0);

  const DIRECTIONS = [
    { dx: 1, dz: 0, cost: 1.0 },
    { dx: -1, dz: 0, cost: 1.0 },
    { dx: 0, dz: 1, cost: 1.0 },
    { dx: 0, dz: -1, cost: 1.0 },
    { dx: 1, dz: 1, cost: 1.414 },
    { dx: -1, dz: 1, cost: 1.414 },
    { dx: 1, dz: -1, cost: 1.414 },
    { dx: -1, dz: -1, cost: 1.414 },
  ];

  let found = false;
  let iterations = 0;
  const MAX_ITERATIONS = 3500;

  while (!frontier.isEmpty() && iterations++ < MAX_ITERATIONS) {
    const currentKey = frontier.pop();
    if (currentKey === targetNodeKey) {
      found = true;
      break;
    }

    const [cgx, cgz] = currentKey.split(',').map(Number);
    const currentCost = costSoFar.get(currentKey);

    for (const dir of DIRECTIONS) {
      const ngx = cgx + dir.dx;
      const ngz = cgz + dir.dz;

      if (ngx < 0 || ngx >= gridWidth || ngz < 0 || ngz >= gridHeight) {
        continue;
      }

      const worldPoint = gridToWorld(ngx, ngz, bounds);
      if (!isCellWalkable(worldPoint.x, worldPoint.z, profile, bounds, floor)) {
        continue;
      }

      // Elevation cost penalty for wheelchair on ramps/slopes
      let stepCost = dir.cost;
      const currentWorld = gridToWorld(cgx, cgz, bounds);
      const elevationDiff = Math.abs(
        getElevationY(worldPoint.x, worldPoint.z, bounds, floor) -
        getElevationY(currentWorld.x, currentWorld.z, bounds, floor)
      );
      stepCost += elevationDiff * 2.0;

      const newCost = currentCost + stepCost;
      const neighborKey = `${ngx},${ngz}`;

      if (!costSoFar.has(neighborKey) || newCost < costSoFar.get(neighborKey)) {
        costSoFar.set(neighborKey, newCost);
        const targetWorld = gridToWorld(targetGrid.gx, targetGrid.gz, bounds);
        const heuristic = Math.hypot(worldPoint.x - targetWorld.x, worldPoint.z - targetWorld.z);
        frontier.push(neighborKey, newCost + heuristic * 1.05);
        cameFrom.set(neighborKey, currentKey);
      }
    }
  }

  // Reconstruct path
  if (!found && cameFrom.size <= 1) {
    // Return direct 2-point line fallback if path obstructed
    return [
      { x: startPos.x, y: getElevationY(startPos.x, startPos.z, bounds, floor), z: startPos.z, floor },
      { x: targetPos.x, y: getElevationY(targetPos.x, targetPos.z, bounds, floor), z: targetPos.z, floor },
    ];
  }

  const rawPath = [];
  let curr = targetNodeKey;

  // In case exact target was unreachable, pick node closest to target
  if (!cameFrom.has(targetNodeKey)) {
    let bestKey = startNodeKey;
    let minDist = Infinity;
    const targetWorld = gridToWorld(targetGrid.gx, targetGrid.gz, bounds);

    for (const [key] of costSoFar) {
      const [gx, gz] = key.split(',').map(Number);
      const w = gridToWorld(gx, gz, bounds);
      const dist = Math.hypot(w.x - targetWorld.x, w.z - targetWorld.z);
      if (dist < minDist) {
        minDist = dist;
        bestKey = key;
      }
    }
    curr = bestKey;
  }

  while (curr) {
    const [gx, gz] = curr.split(',').map(Number);
    const w = gridToWorld(gx, gz, bounds);
    rawPath.push({
      x: Number(w.x.toFixed(2)),
      y: Number(getElevationY(w.x, w.z, bounds, floor).toFixed(2)),
      z: Number(w.z.toFixed(2)),
      floor,
    });
    curr = cameFrom.get(curr);
  }

  rawPath.reverse();

  // Add precise start and target endpoints
  if (rawPath.length > 0) {
    rawPath[0] = { x: startPos.x, y: getElevationY(startPos.x, startPos.z, bounds, floor), z: startPos.z, floor };
    rawPath[rawPath.length - 1] = { x: targetPos.x, y: getElevationY(targetPos.x, targetPos.z, bounds, floor), z: targetPos.z, floor };
  }

  // Smooth path using line-of-sight ray pruning
  const smoothedPath = smoothPath(rawPath, profile, bounds, floor);
  return smoothedPath;
}

/**
 * Multi-Level Master Pathfinding Function
 * Intelligently routes on single floor or stitches multi-floor journeys via Braille Elevator or Stairs
 *
 * @param {{x: number, y?: number, z: number, floor?: number}} startPos - Player starting position
 * @param {{x: number, y?: number, z: number, floor?: number}} targetPos - Destination target
 * @param {'accessible' | 'standard'} profile - Navigation profile ('accessible' for wheelchair, 'standard' for walk)
 * @param {object} customBounds - Dynamic grid boundary limits
 * @returns {Array<{x: number, y: number, z: number, floor?: number}>} Smoothed multi-floor waypoints
 */
export function findPath(startPos, targetPos, profile = 'accessible', customBounds = DEFAULT_BOUNDS) {
  const bounds = customBounds || DEFAULT_BOUNDS;

  const startFloor = startPos.floor !== undefined
    ? Number(startPos.floor)
    : (startPos.y !== undefined ? Math.max(0, Math.min(2, Math.round(startPos.y / 4.0))) : 0);

  const targetFloor = targetPos.floor !== undefined
    ? Number(targetPos.floor)
    : (targetPos.y !== undefined ? Math.max(0, Math.min(2, Math.round(targetPos.y / 4.0))) : 0);

  // 1. Single-Storey Route: same floor level
  if (startFloor === targetFloor) {
    const singlePath = findSingleFloorPath(startPos, targetPos, profile, bounds, startFloor);
    singlePath.interFloorTransition = null;
    return singlePath;
  }

  // 2. Multi-Storey Route: Inter-floor path stitching
  const isWheelchair = profile === 'accessible' || profile === 'wheelchair';
  let connector = VERTICAL_CONNECTORS[0]; // Braille Elevator Alpha (accessible)

  if (!isWheelchair) {
    // Standard walking profile can use either stairs or elevator (pick closest to start position)
    const distElevator = Math.hypot(startPos.x - VERTICAL_CONNECTORS[0].x, startPos.z - VERTICAL_CONNECTORS[0].z);
    const distStairs = Math.hypot(startPos.x - VERTICAL_CONNECTORS[1].x, startPos.z - VERTICAL_CONNECTORS[1].z);
    connector = distStairs <= distElevator ? VERTICAL_CONNECTORS[1] : VERTICAL_CONNECTORS[0];
  }

  // Leg 1: From start position to connector on startFloor
  const connectorStart = { x: connector.x, z: connector.z, floor: startFloor };
  const leg1 = findSingleFloorPath(startPos, connectorStart, profile, bounds, startFloor);

  // Leg 2: From connector on targetFloor to target destination
  const connectorTarget = { x: connector.x, z: connector.z, floor: targetFloor };
  const leg2 = findSingleFloorPath(connectorTarget, targetPos, profile, bounds, targetFloor);

  // Vertical Shaft Waypoints: Smooth vertical elevation spline between floors
  const shaftPoints = [];
  const startY = getElevationY(connector.x, connector.z, bounds, startFloor);
  const endY = getElevationY(connector.x, connector.z, bounds, targetFloor);
  const diffY = endY - startY;
  const numSteps = Math.max(4, Math.ceil(Math.abs(diffY) / 0.5));

  for (let i = 1; i < numSteps; i++) {
    const t = i / numSteps;
    const yVal = Number((startY + diffY * t).toFixed(2));
    shaftPoints.push({
      x: connector.x,
      y: yVal,
      z: connector.z,
      floor: t >= 0.5 ? targetFloor : startFloor,
      isVerticalShaft: true,
      connectorType: connector.id,
    });
  }

  // Stitch Leg 1 + Vertical Shaft + Leg 2
  const combinedPath = [...leg1, ...shaftPoints, ...leg2];
  combinedPath.interFloorTransition = {
    fromFloor: startFloor,
    toFloor: targetFloor,
    connectorId: connector.id,
    connectorName: connector.name,
    connectorShortName: connector.shortName,
    connectorPos: [connector.x, startY, connector.z],
    isAscending: targetFloor > startFloor,
  };

  return combinedPath;
}

/**
 * Line-of-sight path smoothing for a specific floor
 */
function smoothPath(path, profile, bounds = DEFAULT_BOUNDS, floor = 0) {
  if (path.length <= 2) return path;

  const smoothed = [path[0]];
  let currentIdx = 0;

  while (currentIdx < path.length - 1) {
    let furthestVisible = currentIdx + 1;

    for (let testIdx = path.length - 1; testIdx > currentIdx + 1; testIdx--) {
      if (hasLineOfSight(path[currentIdx], path[testIdx], profile, bounds, floor)) {
        furthestVisible = testIdx;
        break;
      }
    }

    smoothed.push(path[furthestVisible]);
    currentIdx = furthestVisible;
  }

  // Ensure heights are computed along the straight chords
  return smoothed.map((pt) => ({
    x: pt.x,
    y: getElevationY(pt.x, pt.z, bounds, floor),
    z: pt.z,
    floor,
  }));
}

/**
 * Checks if line of sight between p1 and p2 is collision-free on a specific floor
 */
function hasLineOfSight(p1, p2, profile, bounds = DEFAULT_BOUNDS, floor = 0) {
  const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
  const steps = Math.ceil(dist / 0.35);

  // If on Level 0 and crossing into/out of deck without using ramp/stairs, deny LOS
  if (floor === 0) {
    const p1Elevated = p1.y > 0.3;
    const p2Elevated = p2.y > 0.3;
    if (p1Elevated !== p2Elevated) {
      return false;
    }
  }

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const testX = p1.x + (p2.x - p1.x) * t;
    const testZ = p1.z + (p2.z - p1.z) * t;
    if (!isCellWalkable(testX, testZ, profile, bounds, floor)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates total 3D path length in meters
 */
export function calculatePathLength(waypoints) {
  if (!waypoints || waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    total += Math.hypot(p2.x - p1.x, p2.z - p1.z);
  }
  return Number(total.toFixed(1));
}
