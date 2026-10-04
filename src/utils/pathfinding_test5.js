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

// Room architectural zones
const COLUMNS = [
  { x: -6, z: -8, r: 0.35 },
  { x: -6, z: 0, r: 0.35 },
  { x: -6, z: 8, r: 0.35 },
  { x: 6, z: -8, r: 0.35 },
  { x: 6, z: 0, r: 0.35 },
  { x: 6, z: 8, r: 0.35 },
];

export const DECK_BOUNDS = { minX: 3.0, maxX: 9.0, minZ: -9.0, maxZ: -1.0, height: 0.65 };
export const RAMP_BOUNDS = { minX: 4.8, maxX: 7.2, minZ: -1.0, maxZ: 3.2 };
export const STAIRS_BOUNDS = { minX: 3.0, maxX: 4.6, minZ: -1.15, maxZ: -0.1 };

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
 * Evaluates whether a world coordinate is walkable under the given profile
 * Profile: 'accessible' (wheelchair) | 'standard' (direct)
 */
export function isCellWalkable(wx, wz, profile = 'accessible', bounds = DEFAULT_BOUNDS) {
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

  // 2. Procedural Showroom architectural columns & deck features (only applied for large showroom space)
  const isShowroom = maxX > 9;
  if (isShowroom) {
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

    // Ramp side curb & handrail barriers: prevent cutting through handrails from sides
    const isRampSideRail =
      ((wx >= 4.5 && wx <= 4.85) || (wx >= 7.15 && wx <= 7.5)) &&
      (wz >= -0.95 && wz <= 3.1);
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
    // Deck perimeter is elevated (+0.6m) with safety railing except at ramp and stairs
    const isDeckPerimeter =
      wx >= DECK_BOUNDS.minX - 0.4 &&
      wx <= DECK_BOUNDS.maxX + 0.4 &&
      wz >= DECK_BOUNDS.minZ - 0.4 &&
      wz <= DECK_BOUNDS.maxZ + 0.4;

    if (isDeckPerimeter && !inDeck && !inRamp) {
      // If not in ramp, check if using stairs
      if (inStairs && !isWheelchair) {
        return true; // standard walk can step up
      }
      // Drop wall everywhere else around deck boundary
      return false;
    }
  }

  return true;
}

/**
 * Computes height Y along the path
 */
function getElevationY(wx, wz, bounds = DEFAULT_BOUNDS) {
  // If compact dataset room, maintain flat floor elevation
  if (bounds && bounds.maxX <= 9) {
    return 0.05;
  }

  // Check if on elevated deck
  if (
    wx >= DECK_BOUNDS.minX &&
    wx <= DECK_BOUNDS.maxX &&
    wz >= DECK_BOUNDS.minZ &&
    wz <= DECK_BOUNDS.maxZ
  ) {
    return DECK_BOUNDS.height;
  }

  // Check if on ramp: slope from z = 3.2 (y = 0.05) to z = -1.0 (y = 0.65)
  if (
    wx >= RAMP_BOUNDS.minX &&
    wx <= RAMP_BOUNDS.maxX &&
    wz >= RAMP_BOUNDS.minZ &&
    wz <= RAMP_BOUNDS.maxZ
  ) {
    const t = (3.2 - wz) / (3.2 - -1.0); // 0 at entrance, 1 at deck
    const clampedT = Math.max(0, Math.min(1, t));
    return 0.05 + clampedT * (DECK_BOUNDS.height - 0.05);
  }

  // Check if on direct stairs: 3 steps between z = -0.1 and z = -1.15
  if (
    wx >= STAIRS_BOUNDS.minX &&
    wx <= STAIRS_BOUNDS.maxX &&
    wz >= STAIRS_BOUNDS.minZ &&
    wz <= STAIRS_BOUNDS.maxZ
  ) {
    if (wz > -0.48) return 0.20; // Step 1 (lowest)
    if (wz > -0.83) return 0.40; // Step 2 (middle)
    return 0.60;                // Step 3 (top)
  }

  // Standard floor height
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
 * Core A* Pathfinding Function
 * @param {{x: number, z: number}} startPos - Player position
 * @param {{x: number, z: number}} targetPos - Destination coordinates
 * @param {'accessible' | 'standard'} profile - Navigation profile
 * @param {object} customBounds - Dynamic grid boundary limits
 * @returns {Array<{x: number, y: number, z: number}>} Smoothed 3D path waypoints
 */
export function findPath(startPos, targetPos, profile = 'accessible', customBounds = DEFAULT_BOUNDS) {
  const bounds = customBounds || DEFAULT_BOUNDS;
  const gridWidth = Math.round(((bounds.maxX ?? MAX_X) - (bounds.minX ?? MIN_X)) / CELL_SIZE);
  const gridHeight = Math.round(((bounds.maxZ ?? MAX_Z) - (bounds.minZ ?? MIN_Z)) / CELL_SIZE);

  const startGrid = worldToGrid(startPos.x, startPos.z, bounds);
  const targetGrid = worldToGrid(targetPos.x, targetPos.z, bounds);

  // If start or target is inside an obstacle, find nearest free cell
  const startWalkable = isCellWalkable(startPos.x, startPos.z, profile, bounds);
  const targetWalkable = isCellWalkable(targetPos.x, targetPos.z, profile, bounds);

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
      if (!isCellWalkable(worldPoint.x, worldPoint.z, profile, bounds)) {
        continue;
      }

      // Step threshold: wheelchair cannot climb vertical drops > 0.1m, walk cannot climb > 0.25m
      const elevCurrent = getElevationY(currentWorld.x, currentWorld.z, bounds);
      const elevNeighbor = getElevationY(worldPoint.x, worldPoint.z, bounds);
      const elevationDiff = Math.abs(elevNeighbor - elevCurrent);
      if (profile === "accessible" || profile === "wheelchair") {
        if (elevationDiff > 0.12) continue;
      } else {
        if (elevationDiff > 0.28) continue;
      }
      let stepCost = dir.cost;
      const currentWorld = gridToWorld(cgx, cgz, bounds);
      const elevationDiff = Math.abs(getElevationY(worldPoint.x, worldPoint.z) - getElevationY(currentWorld.x, currentWorld.z));
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
      { x: startPos.x, y: getElevationY(startPos.x, startPos.z), z: startPos.z },
      { x: targetPos.x, y: getElevationY(targetPos.x, targetPos.z), z: targetPos.z },
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
      y: Number(getElevationY(w.x, w.z).toFixed(2)),
      z: Number(w.z.toFixed(2)),
    });
    curr = cameFrom.get(curr);
  }

  rawPath.reverse();

  // Add precise start and target endpoints
  if (rawPath.length > 0) {
    rawPath[0] = { x: startPos.x, y: getElevationY(startPos.x, startPos.z), z: startPos.z };
    rawPath[rawPath.length - 1] = { x: targetPos.x, y: getElevationY(targetPos.x, targetPos.z), z: targetPos.z };
  }

  // Smooth path using line-of-sight ray pruning
  const smoothedPath = smoothPath(rawPath, profile, bounds);
  return smoothedPath;
}

/**
 * Line-of-sight path smoothing
 */
function smoothPath(path, profile, bounds = DEFAULT_BOUNDS) {
  if (path.length <= 2) return path;

  const smoothed = [path[0]];
  let currentIdx = 0;

  while (currentIdx < path.length - 1) {
    let furthestVisible = currentIdx + 1;

    for (let testIdx = path.length - 1; testIdx > currentIdx + 1; testIdx--) {
      if (hasLineOfSight(path[currentIdx], path[testIdx], profile, bounds)) {
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
    y: getElevationY(pt.x, pt.z),
    z: pt.z,
  }));
}

/**
 * Checks if line of sight between p1 and p2 is collision-free
 */
function hasLineOfSight(p1, p2, profile, bounds = DEFAULT_BOUNDS) {
  const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
  const steps = Math.ceil(dist / 0.35);

  // If crossing into/out of deck without using ramp/stairs, deny LOS
  const p1Elevated = p1.y > 0.3;
  const p2Elevated = p2.y > 0.3;
  if (p1Elevated !== p2Elevated) {
    // Must go through transition nodes
    return false;
  }

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const testX = p1.x + (p2.x - p1.x) * t;
    const testZ = p1.z + (p2.z - p1.z) * t;
    if (!isCellWalkable(testX, testZ, profile, bounds)) {
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
