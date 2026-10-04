import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { MOCK_POIS, POI_CATEGORIES } from '../data/mockPois';

/**
 * Procedural canvas texture generator for 3D billboard text badges in Dollhouse Mode
 */
function createPoiBadgeTexture(poi, cat) {
  const safeCat = cat || POI_CATEGORIES[poi?.category] || POI_CATEGORIES.service || { label: 'Accessible Waypoint', hexColor: '#38bdf8' };
  const clearance = poi?.clearance_cm ?? poi?.clearanceCm ?? 100;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  // Background rounded capsule with glowing glass border
  ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
  ctx.strokeStyle = safeCat.hexColor || '#38bdf8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 120, 30);
  ctx.fill();
  ctx.stroke();

  // Category Icon Dot
  ctx.fillStyle = safeCat.hexColor || '#38bdf8';
  ctx.beginPath();
  ctx.arc(52, 70, 18, 0, Math.PI * 2);
  ctx.fill();

  // Inner white glow dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(52, 70, 8, 0, Math.PI * 2);
  ctx.fill();

  // Primary Title Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(poi?.title || 'Waypoint', 88, 62);

  // Subtitle with clearance and category
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Clearance: ${clearance}cm • ${safeCat.label}`, 88, 102);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Procedural texture generator for high-contrast accessibility floor & tactile strips
 */
function createTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Base Material: Clean architectural ceramic off-white / light gray (Hex #E2E8F0)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle floor tile grid lines (0.8m spacing) (#CBD5E1)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, 254, 254);

  // Ceramic specular grain for natural depth
  ctx.fillStyle = '#f8fafc';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(37.5, 37.5); // 30m / 0.8m = 37.5 tiles
  return texture;
}

function createTactileStripTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#d97706';
  for (let y = 16; y < 256; y += 32) {
    ctx.fillRect(0, y, 256, 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 20);
  return texture;
}

/**
 * Procedural texture for Wheelchair Accessible stairs hazard barrier
 */
function createHazardBarrierTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Red danger background
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, 256, 64);

  // Diagonal safety warning stripes
  ctx.fillStyle = '#ffffff';
  for (let x = -64; x < 320; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x + 18, 64);
    ctx.lineTo(x + 34, 0);
    ctx.lineTo(x + 16, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Dark high-contrast label plaque
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(8, 8, 240, 48);

  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 240, 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⛔ STAIRS: NO WHEELCHAIR', 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural digital LED display texture for elevator landing door frames
 */
function createDigitalElevatorDisplayTexture(label = '▲ LIFT') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');

  // Deep matte black bezel
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 256, 80);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 76);

  // Digital Amber LED typography
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 34px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#d97706';
  ctx.shadowBlur = 12;
  ctx.fillText(label, 128, 40);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural hazard caution stripe texture for elevator landing threshold strips
 */
function createThresholdHazardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Dark slate base
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 64);

  // Vibrant high-visibility amber hazard stripes
  ctx.fillStyle = '#f59e0b';
  for (let x = -64; x < 320; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x + 16, 64);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 16, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Border frame
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, 254, 62);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Procedural animated texture for 3D navigation flow tube
 * Supports distinct visuals for floor, ramp, and stairs
 */
function createPathChevronTexture(segmentType = 'floor') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const isRamp = segmentType === 'ramp' || segmentType === true;
  const isStairs = segmentType === 'stairs';

  if (isRamp) {
    // ADA Incline Ramp Route: Vibrant Violet to Fuchsia gradient with high-emissive glow
    const rampGrad = ctx.createLinearGradient(0, 0, 256, 0);
    rampGrad.addColorStop(0, '#6D28D9');
    rampGrad.addColorStop(0.5, '#A21CAF');
    rampGrad.addColorStop(1.0, '#DB2777');
    ctx.fillStyle = rampGrad;
    ctx.fillRect(0, 0, 256, 64);

    // Glowing borders
    ctx.fillStyle = '#C026D3';
    ctx.fillRect(0, 0, 256, 8);
    ctx.fillRect(0, 56, 256, 8);

    // High-contrast Chevron directional arrows
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#F472B6';
    ctx.shadowBlur = 16;

    for (let x = 32; x < 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x - 18, 12);
      ctx.lineTo(x + 18, 32);
      ctx.lineTo(x - 18, 52);
      ctx.stroke();
    }
  } else if (isStairs) {
    // Direct Stairs Route (Standard Walk): Dark Slate base with bright safety yellow chevrons (#FACC15)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 64);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 8);
    ctx.fillRect(0, 56, 256, 8);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 12;

    for (let x = 32; x < 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x - 14, 16);
      ctx.lineTo(x + 14, 32);
      ctx.lineTo(x - 14, 48);
      ctx.stroke();
    }
  } else {
    // Standard Flat Walkable Floor: Signature NAVI-3D Sunset Gradient (#7C3AED -> #C026D3 -> #F43F5E -> #FB923C)
    const ribbonGrad = ctx.createLinearGradient(0, 0, 256, 0);
    ribbonGrad.addColorStop(0, '#7C3AED');
    ribbonGrad.addColorStop(0.35, '#C026D3');
    ribbonGrad.addColorStop(0.70, '#F43F5E');
    ribbonGrad.addColorStop(1.0, '#FB923C');
    ctx.fillStyle = ribbonGrad;
    ctx.fillRect(0, 0, 256, 64);

    // Accent edge borders
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(0, 0, 256, 5);
    ctx.fillStyle = '#EA580C';
    ctx.fillRect(0, 59, 256, 5);

    // Glowing white forward chevron arrows (>>>)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#F43F5E';
    ctx.shadowBlur = 16;

    for (let x = 32; x < 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x - 16, 14);
      ctx.lineTo(x + 16, 32);
      ctx.lineTo(x - 16, 50);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

/**
 * Builds the Procedural Accessible Indoor Twin Showroom
 */
function buildAccessibleIndoorEnvironment(scene) {
  const group = new THREE.Group();
  group.name = 'AccessibleIndoorTwin';

  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'ProceduralWallsAndProps';

  // 1. Flat Walkable Floor (Clean ceramic off-white / light gray #E2E8F0 with 0.8m grid)
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createTileTexture(),
    roughness: 0.35,
    metalness: 0.05,
    color: 0xffffff,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. High-Contrast Tactile Navigation Strip Guide
  const tactileGeo = new THREE.PlaneGeometry(0.8, 26);
  const tactileMat = new THREE.MeshStandardMaterial({
    map: createTactileStripTexture(),
    roughness: 0.6,
    metalness: 0.1,
  });
  const tactileMesh = new THREE.Mesh(tactileGeo, tactileMat);
  tactileMesh.rotation.x = -Math.PI / 2;
  tactileMesh.position.set(-1.5, 0.005, 0);
  tactileMesh.receiveShadow = true;
  wallsGroup.add(tactileMesh);

  // 3. Elevated Platform Deck & ADA 1:12 Incline Ramp
  const platformHeight = 0.6;
  const rampRun = 4.2; // connects ground z=3.2 to deck z=-1.0 (length 4.2m)
  const rampWidth = 2.4; // X spans 4.8 to 7.2 (centered at x=6.0)

  // Raised Platform Deck (+0.6m Level, Charcoal/Slate #334155)
  const deckGeo = new THREE.BoxGeometry(6, platformHeight, 8);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.1 });
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.position.set(6, platformHeight / 2, -5);
  deckMesh.receiveShadow = true;
  wallsGroup.add(deckMesh);

  // Ramp Mesh Wedge (Surface Material: Vibrant Teal/Cyan #0891B2, roughness: 0.3, metalness: 0.1)
  const rampShape = new THREE.Shape();
  rampShape.moveTo(0, 0);
  rampShape.lineTo(rampRun, 0);
  rampShape.lineTo(rampRun, platformHeight);
  rampShape.closePath();

  const extrudeSettings = { steps: 1, depth: rampWidth, bevelEnabled: false };
  const rampGeo = new THREE.ExtrudeGeometry(rampShape, extrudeSettings);
  const rampMat = new THREE.MeshStandardMaterial({
    color: 0x0891b2,
    roughness: 0.3,
    metalness: 0.1,
  });
  const rampMesh = new THREE.Mesh(rampGeo, rampMat);
  rampMesh.rotation.y = Math.PI / 2;
  rampMesh.position.set(6 - rampWidth / 2, 0, 3.2);
  rampMesh.receiveShadow = true;
  wallsGroup.add(rampMesh);

  // Incline Curbs & Glowing Edge Lines along both ramp borders (x=4.8 and x=7.2)
  const inclineLength = Math.hypot(rampRun, platformHeight);
  const inclineAngle = Math.atan2(platformHeight, rampRun);
  const rampMidY = platformHeight / 2;
  const rampMidZ = (3.2 + -1.0) / 2; // 1.1

  // Protective side curbs (Charcoal/Navy)
  const curbGeo = new THREE.BoxGeometry(0.08, 0.08, inclineLength);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

  const curbLeft = new THREE.Mesh(curbGeo, curbMat);
  curbLeft.rotation.x = inclineAngle;
  curbLeft.position.set(4.8, rampMidY + 0.04, rampMidZ);
  wallsGroup.add(curbLeft);

  const curbRight = new THREE.Mesh(curbGeo, curbMat);
  curbRight.rotation.x = inclineAngle;
  curbRight.position.set(7.2, rampMidY + 0.04, rampMidZ);
  wallsGroup.add(curbRight);

  // Glowing bright cyan edge lines (#00F0FF) along both incline curbs
  const glowGeo = new THREE.BoxGeometry(0.025, 0.025, inclineLength);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  const glowLeft = new THREE.Mesh(glowGeo, glowMat);
  glowLeft.rotation.x = inclineAngle;
  glowLeft.position.set(4.84, rampMidY + 0.08, rampMidZ);
  wallsGroup.add(glowLeft);

  const glowRight = new THREE.Mesh(glowGeo, glowMat);
  glowRight.rotation.x = inclineAngle;
  glowRight.position.set(7.16, rampMidY + 0.08, rampMidZ);
  wallsGroup.add(glowRight);

  // Dual-height Stainless Steel Handrails (Metallic Silver #94A3B8, metalness: 0.88, roughness: 0.15)
  const handrailMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.88,
    roughness: 0.15,
  });
  const handrailGeo = new THREE.CylinderGeometry(0.025, 0.025, inclineLength + 0.2, 16);

  // Upper Rails (at +0.9m above incline for standing reach)
  const upperRailLeft = new THREE.Mesh(handrailGeo, handrailMat);
  upperRailLeft.rotation.x = Math.PI / 2 + inclineAngle;
  upperRailLeft.position.set(4.8, rampMidY + 0.9, rampMidZ);
  wallsGroup.add(upperRailLeft);

  const upperRailRight = new THREE.Mesh(handrailGeo, handrailMat);
  upperRailRight.rotation.x = Math.PI / 2 + inclineAngle;
  upperRailRight.position.set(7.2, rampMidY + 0.9, rampMidZ);
  wallsGroup.add(upperRailRight);

  // Lower Rails (at +0.7m above incline for wheelchair seated reach)
  const lowerRailLeft = new THREE.Mesh(handrailGeo, handrailMat);
  lowerRailLeft.rotation.x = Math.PI / 2 + inclineAngle;
  lowerRailLeft.position.set(4.8, rampMidY + 0.7, rampMidZ);
  wallsGroup.add(lowerRailLeft);

  const lowerRailRight = new THREE.Mesh(handrailGeo, handrailMat);
  lowerRailRight.rotation.x = Math.PI / 2 + inclineAngle;
  lowerRailRight.position.set(7.2, rampMidY + 0.7, rampMidZ);
  wallsGroup.add(lowerRailRight);

  // Vertical Handrail Stanchion Posts (Entry, Mid, Exit)
  const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 16);
  const postZCoords = [3.2, 1.1, -1.0];
  const postYHeights = [0.45, 0.75, 1.05];

  postZCoords.forEach((pz, idx) => {
    const py = postYHeights[idx];
    const postL = new THREE.Mesh(postGeo, handrailMat);
    postL.position.set(4.8, py, pz);
    wallsGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, handrailMat);
    postR.position.set(7.2, py, pz);
    wallsGroup.add(postR);
  });

  // Tactile Yellow Warning Strips (#EAB308) at Ramp Entry (ground) and Exit (deck)
  const entryTactileGeo = new THREE.BoxGeometry(2.4, 0.016, 0.5);
  const entryTactileMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0xca8a04,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });

  const entryTactile = new THREE.Mesh(entryTactileGeo, entryTactileMat);
  entryTactile.position.set(6.0, 0.008, 3.45);
  entryTactile.receiveShadow = true;
  wallsGroup.add(entryTactile);

  const exitTactile = new THREE.Mesh(entryTactileGeo, entryTactileMat);
  exitTactile.position.set(6.0, platformHeight + 0.008, -1.25);
  exitTactile.receiveShadow = true;
  wallsGroup.add(exitTactile);

  // 4. 3-Step Direct Stairs (Solid Dark Slate/Charcoal #334155 with Safety Yellow Nosing #FACC15)
  const stairSteps = 3;
  const stepWidth = 1.6;
  const stepDepth = 0.35;
  const stepHeight = platformHeight / stairSteps; // 0.2m per step

  const stepMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Solid Dark Slate/Charcoal
    roughness: 0.4,
    metalness: 0.1,
  });

  const nosingMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Bright Safety Yellow
    emissive: 0xeab308,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });

  for (let i = 0; i < stairSteps; i++) {
    const stepH = (i + 1) * stepHeight;
    const stepCenterZ = -1.0 + (stairSteps - 1 - i) * stepDepth;
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepH, stepDepth);
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(3.8, stepH / 2, stepCenterZ);
    stepMesh.receiveShadow = true;
    wallsGroup.add(stepMesh);

    // 4cm Bright Safety Yellow Nosing Strip along front edge
    const nosingGeo = new THREE.BoxGeometry(stepWidth, 0.008, 0.04);
    const nosingMesh = new THREE.Mesh(nosingGeo, nosingMat);
    nosingMesh.position.set(3.8, stepH + 0.004, stepCenterZ + stepDepth / 2 - 0.02);
    wallsGroup.add(nosingMesh);
  }

  // Floating Hazard Barrier & Sign for Wheelchair Accessible Mode (above stairs at x=3.8, y=1.25, z=-0.65)
  const stairsBarrierGroup = new THREE.Group();
  stairsBarrierGroup.name = 'StairsWheelchairHazardBarrier';
  stairsBarrierGroup.position.set(3.8, 1.25, -0.65);

  const barrierGeo = new THREE.PlaneGeometry(1.6, 0.42);
  const barrierMat = new THREE.MeshBasicMaterial({
    map: createHazardBarrierTexture(),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
  stairsBarrierGroup.add(barrierMesh);

  // Red beacon warning orbs
  const beaconGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beaconL = new THREE.Mesh(beaconGeo, beaconMat);
  beaconL.position.set(-0.85, 0, 0);
  stairsBarrierGroup.add(beaconL);

  const beaconR = new THREE.Mesh(beaconGeo, beaconMat);
  beaconR.position.set(0.85, 0, 0);
  stairsBarrierGroup.add(beaconR);

  stairsBarrierGroup.visible = false;
  wallsGroup.add(stairsBarrierGroup);

  // 5. Multi-Storey Inter-Floor Connectors
  // A. High-Contrast Glass Elevator Tower Alpha (Centered at x=-6.0, z=-6.0, spans y=0 to y=10.2m)
  const elevatorGroup = new THREE.Group();
  elevatorGroup.name = 'GlassElevatorTower';

  const elevWidth = 2.4;
  const elevDepth = 2.4;
  const elevHeight = 10.2;

  // Structural Slate Corner Columns & Glowing Amber Edge Trim Rods
  const elevColGeo = new THREE.CylinderGeometry(0.05, 0.05, elevHeight, 16);
  const elevColMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });

  const elevTrimGeo = new THREE.CylinderGeometry(0.018, 0.018, elevHeight, 8);
  const elevTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.75,
  });

  const elevCorners = [
    [-6.0 - elevWidth / 2 + 0.05, -6.0 - elevDepth / 2 + 0.05],
    [-6.0 + elevWidth / 2 - 0.05, -6.0 - elevDepth / 2 + 0.05],
    [-6.0 - elevWidth / 2 + 0.05, -6.0 + elevDepth / 2 - 0.05],
    [-6.0 + elevWidth / 2 - 0.05, -6.0 + elevDepth / 2 - 0.05],
  ];

  elevCorners.forEach(([cx, cz]) => {
    // Structural Column
    const col = new THREE.Mesh(elevColGeo, elevColMat);
    col.position.set(cx, elevHeight / 2, cz);
    elevatorGroup.add(col);

    // Glowing Amber Trim Accent
    const trim = new THREE.Mesh(elevTrimGeo, elevTrimMat);
    trim.position.set(cx + (cx > -6.0 ? 0.02 : -0.02), elevHeight / 2, cz + (cz > -6.0 ? 0.02 : -0.02));
    elevatorGroup.add(trim);
  });

  // Translucent Sky-Blue Glass Panels on Left, Right, and Back
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });

  // Back Glass Wall
  const glassBackGeo = new THREE.PlaneGeometry(elevWidth - 0.1, elevHeight);
  const glassBack = new THREE.Mesh(glassBackGeo, glassMat);
  glassBack.position.set(-6.0, elevHeight / 2, -6.0 - elevDepth / 2);
  elevatorGroup.add(glassBack);

  // Left Glass Wall
  const glassSideGeo = new THREE.PlaneGeometry(elevDepth - 0.1, elevHeight);
  const glassLeft = new THREE.Mesh(glassSideGeo, glassMat);
  glassLeft.rotation.y = Math.PI / 2;
  glassLeft.position.set(-6.0 - elevWidth / 2, elevHeight / 2, -6.0);
  elevatorGroup.add(glassLeft);

  // Right Glass Wall
  const glassRight = new THREE.Mesh(glassSideGeo, glassMat);
  glassRight.rotation.y = -Math.PI / 2;
  glassRight.position.set(-6.0 + elevWidth / 2, elevHeight / 2, -6.0);
  elevatorGroup.add(glassRight);

  // Floor Landing Door Portals & Indicator Displays on L0, L1, L2
  const landingLevels = [
    { level: 0, y: 0.0, label: 'L0 | Ground', display: '▲ L0 LIFT' },
    { level: 1, y: 4.0, label: 'L1 | Mezzanine', display: '▲ L1 LIFT' },
    { level: 2, y: 8.0, label: 'L2 | Terrace', display: '▼ L2 LIFT' },
  ];

  const thresholdTexture = createThresholdHazardTexture();

  landingLevels.forEach(({ y, label, display }) => {
    // Portal Door Frame Architrave (front z = -6.0 + elevDepth/2 = -4.8)
    const portalGeo = new THREE.BoxGeometry(1.4, 2.2, 0.08);
    const portalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(-6.0, y + 1.1, -4.8);
    elevatorGroup.add(portal);

    // Glowing Amber Portal Header Lintel Trim
    const headerTrimGeo = new THREE.BoxGeometry(1.46, 0.06, 0.1);
    const headerTrim = new THREE.Mesh(headerTrimGeo, elevTrimMat);
    headerTrim.position.set(-6.0, y + 2.22, -4.8);
    elevatorGroup.add(headerTrim);

    // Digital LED Floor Display Sign above portal
    const displayTex = createDigitalElevatorDisplayTexture(display);
    const displayGeo = new THREE.PlaneGeometry(0.55, 0.18);
    const displayMat = new THREE.MeshBasicMaterial({ map: displayTex, side: THREE.DoubleSide });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(-6.0, y + 2.38, -4.74);
    elevatorGroup.add(displayMesh);

    // Floor Entrance Threshold Hazard Strip (placed flat on landing floor at z = -4.55)
    const threshGeo = new THREE.PlaneGeometry(1.4, 0.45);
    const threshMat = new THREE.MeshStandardMaterial({ map: thresholdTexture, roughness: 0.5 });
    const threshMesh = new THREE.Mesh(threshGeo, threshMat);
    threshMesh.rotation.x = -Math.PI / 2;
    threshMesh.position.set(-6.0, y + 0.005, -4.55);
    elevatorGroup.add(threshMesh);

    // Braille Call Pedestal
    const callPedGeo = new THREE.BoxGeometry(0.12, 0.9, 0.12);
    const callPed = new THREE.Mesh(callPedGeo, handrailMat);
    callPed.position.set(-4.95, y + 0.45, -4.75);
    elevatorGroup.add(callPed);

    const callBtnGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const callBtnMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const callBtn = new THREE.Mesh(callBtnGeo, callBtnMat);
    callBtn.position.set(-4.95, y + 0.95, -4.68);
    elevatorGroup.add(callBtn);

    // Pulsing Amber Call Disc Beacon on Floor beside pedestal
    const beaconGeo = new THREE.RingGeometry(0.08, 0.18, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = -Math.PI / 2;
    beacon.position.set(-4.95, y + 0.006, -4.75);
    elevatorGroup.add(beacon);
  });

  // Dedicated High-Contrast Moving Elevator Cab Group
  const elevatorCar = new THREE.Group();
  elevatorCar.name = 'ElevatorMovingCab';
  elevatorCar.position.set(-6.0, 1.15, -6.0); // Starts at ground floor (center y=1.15)

  // 1. Cab Floor Plate (Deep slate with brushed metal finish)
  const cabFloorGeo = new THREE.BoxGeometry(elevWidth - 0.22, 0.08, elevDepth - 0.22);
  const cabFloorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.85,
  });
  const cabFloorMesh = new THREE.Mesh(cabFloorGeo, cabFloorMat);
  cabFloorMesh.position.y = -1.15 + 0.04; // Floor surface at y = -1.11 relative to cab center
  elevatorCar.add(cabFloorMesh);

  // 2. Glowing Amber Base Trim Band
  const cabTrimGeo = new THREE.BoxGeometry(elevWidth - 0.18, 0.04, elevDepth - 0.18);
  const cabTrimMesh = new THREE.Mesh(cabTrimGeo, elevTrimMat);
  cabTrimMesh.position.y = -1.15 + 0.08;
  elevatorCar.add(cabTrimMesh);

  // 3. Cab Ceiling Plate
  const cabRoofGeo = new THREE.BoxGeometry(elevWidth - 0.22, 0.08, elevDepth - 0.22);
  const cabRoofMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.9,
  });
  const cabRoofMesh = new THREE.Mesh(cabRoofGeo, cabRoofMat);
  cabRoofMesh.position.y = 1.15 - 0.04;
  elevatorCar.add(cabRoofMesh);

  // 4. Warm Interior LED Downlight
  const cabLight = new THREE.PointLight(0xfef3c7, 1.2, 3.5);
  cabLight.position.set(0, 0.85, 0);
  elevatorCar.add(cabLight);

  // 5. Panoramic Glass Enclosure on 3 sides
  const cabGlassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.05,
    metalness: 0.25,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
  });

  const cabBackGlass = new THREE.Mesh(new THREE.PlaneGeometry(elevWidth - 0.26, 2.1), cabGlassMat);
  cabBackGlass.position.set(0, 0, -(elevDepth - 0.22) / 2);
  elevatorCar.add(cabBackGlass);

  const cabLeftGlass = new THREE.Mesh(new THREE.PlaneGeometry(elevDepth - 0.26, 2.1), cabGlassMat);
  cabLeftGlass.rotation.y = Math.PI / 2;
  cabLeftGlass.position.set(-(elevWidth - 0.22) / 2, 0, 0);
  elevatorCar.add(cabLeftGlass);

  const cabRightGlass = new THREE.Mesh(new THREE.PlaneGeometry(elevDepth - 0.26, 2.1), cabGlassMat);
  cabRightGlass.rotation.y = -Math.PI / 2;
  cabRightGlass.position.set((elevWidth - 0.22) / 2, 0, 0);
  elevatorCar.add(cabRightGlass);

  // 6. Polished Chrome Handrail inside cab
  const cabRailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  const cabRailGeo = new THREE.CylinderGeometry(0.02, 0.02, elevWidth - 0.35, 12);
  const cabRail = new THREE.Mesh(cabRailGeo, cabRailMat);
  cabRail.rotation.z = Math.PI / 2;
  cabRail.position.set(0, -0.25, -(elevDepth - 0.32) / 2);
  elevatorCar.add(cabRail);

  elevatorGroup.add(elevatorCar);
  wallsGroup.add(elevatorGroup);

  // B. Central Inter-Floor Stairwells
  // Flight 1: Ground to Mezzanine (L0 -> L1, y=0 to y=4.0m)
  const mezStairSteps = 16;
  const mezStairStepHeight = 4.0 / mezStairSteps; // 0.25m per step
  const mezStairStepDepth = 0.32;
  const mezStairWidth = 1.6;

  for (let s = 0; s < mezStairSteps; s++) {
    const stepH = (s + 1) * mezStairStepHeight;
    const stepZ = 3.2 - s * mezStairStepDepth;
    const stepGeo = new THREE.BoxGeometry(mezStairWidth, stepH, mezStairStepDepth);
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(3.8, stepH / 2, stepZ);
    stepMesh.receiveShadow = true;
    wallsGroup.add(stepMesh);

    // High-visibility bright safety yellow nosing edge
    const nosingGeo = new THREE.BoxGeometry(mezStairWidth, 0.015, 0.04);
    const nosingMesh = new THREE.Mesh(nosingGeo, nosingMat);
    nosingMesh.position.set(3.8, stepH + 0.008, stepZ + mezStairStepDepth / 2 - 0.02);
    wallsGroup.add(nosingMesh);
  }

  // Dual Stainless Steel Safety Handrails for Flight 1 (outer at x = 3.8 + 0.85 = 4.65, inner at x = 3.8 - 0.85 = 2.95)
  const flight1Length = Math.hypot(4.8, 4.0);
  const flight1Angle = Math.atan2(4.0, 4.8);
  const railGeo1 = new THREE.CylinderGeometry(0.025, 0.025, flight1Length, 12);
  [2.95, 4.65].forEach((rx) => {
    const rail = new THREE.Mesh(railGeo1, handrailMat);
    rail.position.set(rx, 2.0 + 0.9, 0.8);
    rail.rotation.x = Math.PI / 2 - flight1Angle;
    wallsGroup.add(rail);
  });

  // Flight 2: Mezzanine to Terrace (L1 -> L2, y=4.0m to y=8.0m)
  for (let s = 0; s < mezStairSteps; s++) {
    const stepH = 4.0 + (s + 1) * mezStairStepHeight;
    const stepZ = -3.2 + s * mezStairStepDepth;
    const stepGeo = new THREE.BoxGeometry(mezStairWidth, stepH - 4.0, mezStairStepDepth);
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(3.8, 4.0 + (stepH - 4.0) / 2, stepZ);
    stepMesh.receiveShadow = true;
    wallsGroup.add(stepMesh);

    // High-visibility bright safety yellow nosing edge
    const nosingGeo = new THREE.BoxGeometry(mezStairWidth, 0.015, 0.04);
    const nosingMesh = new THREE.Mesh(nosingGeo, nosingMat);
    nosingMesh.position.set(3.8, stepH + 0.008, stepZ + mezStairStepDepth / 2 - 0.02);
    wallsGroup.add(nosingMesh);
  }

  // Dual Stainless Steel Safety Handrails for Flight 2
  const railGeo2 = new THREE.CylinderGeometry(0.025, 0.025, flight1Length, 12);
  [2.95, 4.65].forEach((rx) => {
    const rail = new THREE.Mesh(railGeo2, handrailMat);
    rail.position.set(rx, 6.0 + 0.9, -0.8);
    rail.rotation.x = -(Math.PI / 2 - flight1Angle);
    wallsGroup.add(rail);
  });

  // 6. Level 1: Mezzanine Floor Plate with Open Central Atrium Void (y = 4.0m)
  const mezShape = new THREE.Shape();
  mezShape.moveTo(-15, -12);
  mezShape.lineTo(15, -12);
  mezShape.lineTo(15, 12);
  mezShape.lineTo(-15, 12);
  mezShape.closePath();

  // Atrium Void Cutout (x in [-3.2, 3.2], z in [-3.2, 3.2])
  const atriumHole = new THREE.Path();
  atriumHole.moveTo(-3.2, -3.2);
  atriumHole.lineTo(3.2, -3.2);
  atriumHole.lineTo(3.2, 3.2);
  atriumHole.lineTo(-3.2, 3.2);
  atriumHole.closePath();
  mezShape.holes.push(atriumHole);

  const mezFloorGeo = new THREE.ShapeGeometry(mezShape);
  const mezFloorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.05,
  });
  const mezFloorMesh = new THREE.Mesh(mezFloorGeo, mezFloorMat);
  mezFloorMesh.rotation.x = -Math.PI / 2;
  mezFloorMesh.position.y = 4.0;
  mezFloorMesh.receiveShadow = true;
  group.add(mezFloorMesh);

  // Atrium Void Perimeter Glass Balustrade (height 1.05m above L1 floor)
  const balustradeMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const atriumSides = [
    { x: 0, z: -3.2, rot: 0, len: 6.4 },
    { x: 0, z: 3.2, rot: 0, len: 6.4 },
    { x: -3.2, z: 0, rot: Math.PI / 2, len: 6.4 },
    { x: 3.2, z: 0, rot: Math.PI / 2, len: 6.4 },
  ];

  atriumSides.forEach((side) => {
    // Glass panel
    const bGeo = new THREE.PlaneGeometry(side.len, 1.05);
    const bMesh = new THREE.Mesh(bGeo, balustradeMat);
    bMesh.rotation.y = side.rot;
    bMesh.position.set(side.x, 4.0 + 1.05 / 2, side.z);
    wallsGroup.add(bMesh);

    // Stainless top handrail
    const rGeo = new THREE.CylinderGeometry(0.025, 0.025, side.len, 16);
    const rMesh = new THREE.Mesh(rGeo, handrailMat);
    rMesh.rotation.z = Math.PI / 2;
    rMesh.rotation.y = side.rot;
    rMesh.position.set(side.x, 4.0 + 1.05, side.z);
    wallsGroup.add(rMesh);
  });

  // 7. Level 2: Terrace & Rooftop Observation Deck (y = 8.0m)
  const terraceGeo = new THREE.BoxGeometry(28, 0.2, 22);
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Architectural Charcoal Slate Terrace
    roughness: 0.45,
    metalness: 0.15,
  });
  const terraceFloorMesh = new THREE.Mesh(terraceGeo, terraceMat);
  terraceFloorMesh.position.set(0, 8.0 - 0.1, 0);
  terraceFloorMesh.receiveShadow = true;
  group.add(terraceFloorMesh);

  // Terrace Perimeter Glass Balustrade
  const terraceSides = [
    { x: 0, z: -11.0, rot: 0, len: 28 },
    { x: 0, z: 11.0, rot: 0, len: 28 },
    { x: -14.0, z: 0, rot: Math.PI / 2, len: 22 },
    { x: 14.0, z: 0, rot: Math.PI / 2, len: 22 },
  ];

  terraceSides.forEach((side) => {
    const tBGeo = new THREE.PlaneGeometry(side.len, 1.1);
    const tBMesh = new THREE.Mesh(tBGeo, balustradeMat);
    tBMesh.rotation.y = side.rot;
    tBMesh.position.set(side.x, 8.0 + 1.1 / 2, side.z);
    wallsGroup.add(tBMesh);

    const tRGeo = new THREE.CylinderGeometry(0.025, 0.025, side.len, 16);
    const tRMesh = new THREE.Mesh(tRGeo, handrailMat);
    tRMesh.rotation.z = Math.PI / 2;
    tRMesh.rotation.y = side.rot;
    tRMesh.position.set(side.x, 8.0 + 1.1, side.z);
    wallsGroup.add(tRMesh);
  });

  // Terrace Pergola Canopy Rafters (Open sky architectural timber/steel pergola at y = 11.2m)
  for (let px = -10; px <= 10; px += 2.5) {
    const rafterGeo = new THREE.BoxGeometry(0.12, 0.25, 20);
    const rafterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const rafter = new THREE.Mesh(rafterGeo, rafterMat);
    rafter.position.set(px, 11.2, 0);
    wallsGroup.add(rafter);
  }

  // 8. Multi-Storey Structural Perimeter Walls (Spanning Ground y=0 to y=12.0m)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const totalBuildingH = 12.0;

  const backWallGeo = new THREE.BoxGeometry(30, totalBuildingH, 0.4);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, totalBuildingH / 2, -12);
  wallsGroup.add(backWall);

  const sideWallGeo = new THREE.BoxGeometry(0.4, totalBuildingH, 24);
  const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
  leftWall.position.set(-15, totalBuildingH / 2, 0);
  wallsGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
  rightWall.position.set(15, totalBuildingH / 2, 0);
  wallsGroup.add(rightWall);

  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(30, 24);
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 12.0, 0);
  group.add(ceiling);

  // Structural Columns (Extending through storeys)
  const colGeo = new THREE.CylinderGeometry(0.35, 0.35, totalBuildingH, 32);
  const colMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
  const colPositions = [
    [-6, -8], [-6, 0], [-6, 8],
    [6, -8], [6, 8]
  ];
  colPositions.forEach(([colX, colZ]) => {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(colX, totalBuildingH / 2, colZ);
    col.castShadow = true;
    wallsGroup.add(col);
  });

  // Lighting across all levels
  // Level 0 Under-Ceiling Lights
  for (let z = -8; z <= 8; z += 4) {
    const pointLightL0 = new THREE.PointLight(0xfff7ed, 0.45, 8);
    pointLightL0.position.set(0, 3.8, z);
    wallsGroup.add(pointLightL0);

    const pointLightL1 = new THREE.PointLight(0xfff7ed, 0.45, 8);
    pointLightL1.position.set(0, 7.8, z);
    wallsGroup.add(pointLightL1);
  }

  // Sunlight and Ambient lighting illuminating the Atrium & Terrace
  const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
  group.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.1);
  dirLight.position.set(6, 18, 8);
  dirLight.castShadow = true;
  group.add(dirLight);

  group.add(wallsGroup);
  scene.add(group);
  return {
    group,
    wallsGroup,
    floorMesh,
    ceiling,
    stairsBarrier: stairsBarrierGroup,
    mezFloorMesh,
    terraceFloorMesh,
    elevatorCar,
    elevatorGroup,
  };
}

/**
 * Builds 3D Interactive POI Pins & Billboard Badges
 */
function build3DPois(scene, pois) {
  const poiObjects = [];
  const hitTargets = [];
  const badgeSprites = [];

  pois.forEach((poi) => {
    const cat = POI_CATEGORIES[poi.category] || POI_CATEGORIES.service || POI_CATEGORIES.accessible_ramp;
    const group = new THREE.Group();
    group.position.set(...poi.position);

    // 1. Outer Diamond
    const outerGeo = new THREE.OctahedronGeometry(0.24, 0);
    const outerMat = new THREE.MeshBasicMaterial({
      color: cat.hexColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const innerMat = new THREE.MeshStandardMaterial({
      color: cat.hexColor,
      emissive: cat.hexColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // 3. Anchor Stem
    const stemHeight = poi.position[1];
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, stemHeight, 8);
    const stemMat = new THREE.MeshBasicMaterial({
      color: cat.hexColor,
      transparent: true,
      opacity: 0.4,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = -stemHeight / 2;
    group.add(stemMesh);

    // 4. Ground Beacon Ring
    const ringGeo = new THREE.RingGeometry(0.25, 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cat.hexColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -stemHeight + 0.02;
    group.add(ringMesh);

    // 5. Radar Ping Concentric Rings
    const pingRings = [];
    for (let r = 0; r < 3; r++) {
      const pGeo = new THREE.RingGeometry(0.25, 0.32, 32);
      const pMat = new THREE.MeshBasicMaterial({
        color: cat.hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = Math.PI / 2;
      pMesh.position.y = -stemHeight + 0.03 + r * 0.005;
      group.add(pMesh);
      pingRings.push(pMesh);
    }

    // 6. Invisible Hit Sphere
    const hitGeo = new THREE.SphereGeometry(0.65, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { poi, group };
    group.add(hitMesh);
    hitTargets.push(hitMesh);

    // 7. Floating 3D Billboard Badge (visible in Dollhouse Mode)
    const badgeMat = new THREE.SpriteMaterial({
      map: createPoiBadgeTexture(poi, cat),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const badgeSprite = new THREE.Sprite(badgeMat);
    badgeSprite.scale.set(3.4, 0.95, 1);
    badgeSprite.position.set(0, 0.72, 0);
    badgeSprite.visible = false;
    badgeSprite.userData = { poi, group };
    group.add(badgeSprite);
    hitTargets.push(badgeSprite);
    badgeSprites.push(badgeSprite);

    scene.add(group);
    poiObjects.push({
      poi,
      group,
      outerMesh,
      innerMesh,
      ringMesh,
      pingRings,
      badgeSprite,
      initialY: poi.position[1],
    });
  });

  return { poiObjects, hitTargets, badgeSprites };
}

/**
 * SplatViewer Component
 */
export default function SplatViewer({
  dataset = null,
  splatUrl,
  mode = 'walk',
  viewMode = 'first_person', // 'first_person' | 'dollhouse'
  datasetType = 'splat', // 'splat' | 'procedural' | 'custom'
  pois = null,
  customModel = null,
  activeRouteWaypoints = null,
  navigationTargetPoi = null,
  flyToPoi = null,
  isOverlayActive = false,
  onLockChange,
  onFpsUpdate,
  onProgress,
  onStatusChange,
  onTargetPoi,
  onSelectPoi,
  onPlayerMove,
  onPoisLoaded,
  currentFloorLevel = 0,
  onFloorChange = null,
  onRouteProgress = null,
}) {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const cameraRef = useRef(null);
  const splatViewerRef = useRef(null);
  const sceneRef = useRef(null);
  const isSplatLoadedRef = useRef(false);
  const modeRef = useRef(mode);
  const viewModeRef = useRef(viewMode);
  const targetPoiRef = useRef(null);
  const ceilingMeshRef = useRef(null);
  const floorMeshRef = useRef(null);
  const proceduralWallsRef = useRef(null);
  const poiBadgesRef = useRef([]);
  const poiObjectsRef = useRef([]);
  const hitTargetsRef = useRef([]);
  const badgeSpritesRef = useRef([]);
  const datasetTypeRef = useRef(datasetType);
  const currentFloorLevelRef = useRef(currentFloorLevel);
  const elevatorCarRef = useRef(null);
  const floorTransitionRef = useRef(null);
  const walkingPointerRef = useRef(null);
  const liveWaypointsRef = useRef(null);
  const buildPathRibbonRef = useRef(null);

  // Callback refs to ensure stable loop access without unmounting
  const onFpsUpdateRef = useRef(onFpsUpdate);
  const onLockChangeRef = useRef(onLockChange);
  const onProgressRef = useRef(onProgress);
  const onStatusChangeRef = useRef(onStatusChange);
  const onTargetPoiRef = useRef(onTargetPoi);
  const onSelectPoiRef = useRef(onSelectPoi);
  const onPlayerMoveRef = useRef(onPlayerMove);
  const onFloorChangeRef = useRef(onFloorChange);
  const onRouteProgressRef = useRef(onRouteProgress);

  // Smooth camera height and floor transition when currentFloorLevel updates
  useEffect(() => {
    currentFloorLevelRef.current = currentFloorLevel;
    if (cameraRef.current && viewModeRef.current === 'first_person') {
      const eyeHeight = modeRef.current === 'wheelchair' ? 1.2 : 1.6;
      const targetY = currentFloorLevel * 4.0 + eyeHeight;
      floorTransitionRef.current = {
        active: true,
        startY: cameraRef.current.position.y,
        targetY: targetY,
        startTime: performance.now(),
        duration: 900,
      };
    }
  }, [currentFloorLevel]);

  useEffect(() => { onFpsUpdateRef.current = onFpsUpdate; }, [onFpsUpdate]);
  useEffect(() => { onLockChangeRef.current = onLockChange; }, [onLockChange]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);
  useEffect(() => { onTargetPoiRef.current = onTargetPoi; }, [onTargetPoi]);
  useEffect(() => { onSelectPoiRef.current = onSelectPoi; }, [onSelectPoi]);
  useEffect(() => { onPlayerMoveRef.current = onPlayerMove; }, [onPlayerMove]);
  useEffect(() => { onFloorChangeRef.current = onFloorChange; }, [onFloorChange]);
  useEffect(() => { onRouteProgressRef.current = onRouteProgress; }, [onRouteProgress]);

  // Standing player pose in first-person mode
  const lastPlayerPosRef = useRef(new THREE.Vector3(0, 1.6, 5));
  const lastPlayerQuatRef = useRef(new THREE.Quaternion());
  const viewTransitionRef = useRef({ active: false });
  const pointerDownPosRef = useRef(null);

  // Spline Path mesh & texture refs
  const pathBaseOutlineRef = useRef(null);
  const pathMeshRef = useRef(null);
  const pathTextureRef = useRef(null);
  const pathMeshesRef = useRef([]);
  const pathOutlinesRef = useRef([]);
  const pathTexturesRef = useRef([]);
  const stairDotsRef = useRef([]);
  const stairsBarrierRef = useRef(null);
  const destBeaconRef = useRef(null);
  const destRipplesRef = useRef([]);
  const destBadgeRef = useRef(null);
  const navigationTargetPoiRef = useRef(navigationTargetPoi);

  useEffect(() => {
    navigationTargetPoiRef.current = navigationTargetPoi;
  }, [navigationTargetPoi]);

  // Flight & Radar Ping state refs
  const flightStateRef = useRef({ active: false });
  const radarPingRef = useRef({ poiId: null, startTime: 0, duration: 2500 });
  const activeLoadIdRef = useRef(0);
  const triggerDatasetLoadRef = useRef(null);

  useEffect(() => {
    modeRef.current = mode;
    if (stairsBarrierRef.current) {
      stairsBarrierRef.current.visible = (mode === 'wheelchair');
    }
  }, [mode]);

  // Dynamic POI recreation function
  const rebuildPois = useCallback((poisList) => {
    if (!sceneRef.current) return;

    // Dispose old POIs
    poiObjectsRef.current.forEach((item) => {
      sceneRef.current.remove(item.group);
      item.group.traverse((child) => {
        child.geometry?.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.map?.dispose();
              m.dispose();
            });
          } else {
            child.material.map?.dispose();
            child.material.dispose();
          }
        }
      });
    });

    const { poiObjects, hitTargets, badgeSprites } = build3DPois(sceneRef.current, poisList);
    poiObjectsRef.current = poiObjects;
    hitTargetsRef.current = hitTargets;
    badgeSpritesRef.current = badgeSprites;
    poiBadgesRef.current = badgeSprites;

    // Sync billboard badge visibility with viewMode
    const showBadges = viewModeRef.current === 'dollhouse';
    badgeSprites.forEach((b) => (b.visible = showBadges));
  }, []);

  // Update POIs whenever pois prop changes
  useEffect(() => {
    if (pois && sceneRef.current) {
      rebuildPois(pois);
    }
  }, [pois, rebuildPois]);

  // Dynamic Dataset Loading & Clean WebGL Unload
  const applyDataset = useCallback(async () => {
    if (!sceneRef.current || !splatViewerRef.current) return;
    const currentLoadId = ++activeLoadIdRef.current;
    datasetTypeRef.current = datasetType;

    const targetDataset = dataset || {};
    const targetType = datasetType;

    // 1. Cleanly unload any active splat scene(s) to prevent WebGL memory leaks
    if (splatViewerRef.current) {
      try {
        const count = splatViewerRef.current.getSceneCount();
        if (count > 0) {
          const indices = [];
          for (let i = 0; i < count; i++) indices.push(i);
          await splatViewerRef.current.removeSplatScenes(indices, false);
        }
      } catch (e) {
        console.warn('removeSplatScenes exception:', e);
      }
    }
    isSplatLoadedRef.current = false;
    if (splatViewerRef.current?.splatMesh) {
      splatViewerRef.current.splatMesh.visible = false;
    }

    if (currentLoadId !== activeLoadIdRef.current) return;

    // 2. Clear lingering navigation path mesh and destination beacon ripples
    if (pathBaseOutlineRef.current && sceneRef.current) {
      sceneRef.current.remove(pathBaseOutlineRef.current);
      pathBaseOutlineRef.current.geometry?.dispose();
      pathBaseOutlineRef.current.material?.dispose();
      pathBaseOutlineRef.current = null;
    }
    if (pathMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(pathMeshRef.current);
      pathMeshRef.current.geometry?.dispose();
      pathMeshRef.current.material?.dispose();
      pathMeshRef.current = null;
    }
    if (destBeaconRef.current && sceneRef.current) {
      sceneRef.current.remove(destBeaconRef.current);
      destBeaconRef.current.geometry?.dispose();
      destBeaconRef.current.material?.dispose();
      destBeaconRef.current = null;
    }
    if (destRipplesRef.current && sceneRef.current) {
      destRipplesRef.current.forEach((r) => {
        sceneRef.current.remove(r);
        r.geometry?.dispose();
        r.material?.dispose();
      });
      destRipplesRef.current = [];
    }

    // 3. Reset Camera Spawn Position & Direction for the dataset
    const spawnPos = targetDataset.spawnPosition || [0, modeRef.current === 'wheelchair' ? 1.2 : 1.6, 5];
    const spawnLook = targetDataset.spawnLookAt || [0, 1.2, 0];
    const camera = cameraRef.current;
    const orbit = orbitControlsRef.current;

    if (camera) {
      camera.position.set(spawnPos[0], spawnPos[1], spawnPos[2]);
      camera.lookAt(spawnLook[0], spawnLook[1], spawnLook[2]);

      if (orbit) {
        orbit.target.set(spawnLook[0], spawnLook[1], spawnLook[2]);
        orbit.update();
      }

      // Synchronize player position with minimap and HUD
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      const yaw = Math.atan2(cameraDir.x, -cameraDir.z);
      onPlayerMoveRef.current?.(spawnPos[0], spawnPos[2], yaw, spawnPos[1], cameraDir.x, cameraDir.z);
    }

    // 4. Handle Procedural Showroom Mode
    if (targetType === 'procedural') {
      if (proceduralWallsRef.current) proceduralWallsRef.current.visible = true;
      if (ceilingMeshRef.current) ceilingMeshRef.current.visible = viewModeRef.current !== 'dollhouse';
      onProgressRef.current?.(100);
      onStatusChangeRef.current?.({
        type: 'ready',
        message: `Active Dataset: ${targetDataset.name || 'Procedural Accessible Showroom'}`,
      });
      return;
    }

    // For splat captures, hide procedural CAD geometry
    if (proceduralWallsRef.current) proceduralWallsRef.current.visible = false;
    if (ceilingMeshRef.current) ceilingMeshRef.current.visible = false;

    // 5. Determine Splat Stream Source URL
    let streamUrl = splatUrl || targetDataset.splatUrl;
    let modelLabel = targetDataset.name || '3D Gaussian Splats';

    if (targetType === 'custom' && customModel) {
      streamUrl = customModel.url || (customModel.file ? URL.createObjectURL(customModel.file) : null);
      modelLabel = customModel.file?.name || 'Custom Uploaded Model';
    }

    if (!streamUrl) {
      if (proceduralWallsRef.current) proceduralWallsRef.current.visible = true;
      if (ceilingMeshRef.current) ceilingMeshRef.current.visible = viewModeRef.current !== 'dollhouse';
      onProgressRef.current?.(100);
      onStatusChangeRef.current?.({
        type: 'fallback',
        message: 'No 3D splat URL provided. Displaying Procedural Twin Showroom.',
      });
      return;
    }

    // Detect format
    const cleanUrl = streamUrl.toLowerCase();
    let format = GaussianSplats3D.SceneFormat.Splat;
    if (cleanUrl.endsWith('.ply') || cleanUrl.includes('.ply?')) format = GaussianSplats3D.SceneFormat.Ply;
    else if (cleanUrl.endsWith('.ksplat') || cleanUrl.includes('.ksplat?')) format = GaussianSplats3D.SceneFormat.KSplat;
    else if (cleanUrl.endsWith('.spz') || cleanUrl.includes('.spz?')) format = GaussianSplats3D.SceneFormat.Spz;

    onProgressRef.current?.(10);
    onStatusChangeRef.current?.({
      type: 'loading',
      message: `Streaming 3D Splats (${targetDataset.source || 'CDN'}): ${modelLabel}...`,
    });

    try {
      if (!splatViewerRef.current) {
        return;
      }
      const splatOptions = {
        format,
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        position: targetDataset.splatPosition || [0, 0, 0],
        rotation: targetDataset.splatRotation || [0, 0, 0, 1],
        scale: targetDataset.splatScale || [1, 1, 1],
      };

      try {
        await splatViewerRef.current.addSplatScene(
          streamUrl,
          splatOptions,
          (progressPercent) => {
            if (currentLoadId !== activeLoadIdRef.current) return;
            const pct = Math.min(Math.round(progressPercent), 99);
            onProgressRef.current?.(pct);
          }
        );
      } catch (primaryErr) {
        if (targetDataset.fallbackUrl && streamUrl !== targetDataset.fallbackUrl) {
          console.warn(`Primary splat stream failed (${streamUrl}), retrying fallback URL (${targetDataset.fallbackUrl}):`, primaryErr);
          await splatViewerRef.current.addSplatScene(
            targetDataset.fallbackUrl,
            splatOptions,
            (progressPercent) => {
              if (currentLoadId !== activeLoadIdRef.current) return;
              const pct = Math.min(Math.round(progressPercent), 99);
              onProgressRef.current?.(pct);
            }
          );
        } else {
          throw primaryErr;
        }
      }

      if (currentLoadId !== activeLoadIdRef.current) return;

      isSplatLoadedRef.current = true;
      if (splatViewerRef.current?.splatMesh) {
        splatViewerRef.current.splatMesh.visible = true;
      }
      onProgressRef.current?.(100);
      onStatusChangeRef.current?.({
        type: 'ready',
        message: `Streamed 3D Twin: ${modelLabel}`,
      });
    } catch (err) {
      if (currentLoadId !== activeLoadIdRef.current) return;
      console.warn('Splat stream error, activating procedural showroom fallback:', err);
      isSplatLoadedRef.current = false;
      if (proceduralWallsRef.current) proceduralWallsRef.current.visible = true;
      if (ceilingMeshRef.current) ceilingMeshRef.current.visible = viewModeRef.current !== 'dollhouse';
      onProgressRef.current?.(100);
      onStatusChangeRef.current?.({
        type: 'fallback',
        message: `Remote 3D stream unreachable (${modelLabel}). Active: Procedural Accessible Twin.`,
      });
    }
  }, [dataset, datasetType, splatUrl, customModel]);

  triggerDatasetLoadRef.current = applyDataset;

  // React to dataset, datasetType, splatUrl, or customModel changes
  useEffect(() => {
    applyDataset();
  }, [applyDataset]);

  // Automatic Pointer Lock Release on UI Popups / Overlays
  useEffect(() => {
    if (isOverlayActive && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
  }, [isOverlayActive]);

  // Handle Fly-To POI Cinematic Transition
  useEffect(() => {
    if (!flyToPoi || !cameraRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Release mouse pointer lock unconditionally for flyover
    if (controls?.isLocked) {
      controls.unlock();
    }
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    const tx = flyToPoi.position[0];
    const ty = flyToPoi.position[1];
    const tz = flyToPoi.position[2];

    // Compute vantage point ~2.8m from POI
    let dirX = camera.position.x - tx;
    let dirZ = camera.position.z - tz;
    let dist = Math.hypot(dirX, dirZ);

    if (dist < 0.2) {
      dirX = 0;
      dirZ = 1;
      dist = 1;
    }
    dirX /= dist;
    dirZ /= dist;

    const eyeH = modeRef.current === 'wheelchair' ? 1.2 : 1.6;
    const endX = Math.max(-13, Math.min(13, tx + dirX * 2.8));
    const endZ = Math.max(-10.5, Math.min(10.5, tz + dirZ * 2.8));
    const poiElev = typeof ty === 'number' ? ty : 0;
    const endPos = new THREE.Vector3(endX, poiElev + eyeH, endZ);

    // Compute target rotation facing POI
    const dummy = new THREE.Object3D();
    dummy.position.copy(endPos);
    dummy.lookAt(tx, ty + 0.15, tz);
    const endQuat = dummy.quaternion.clone();

    flightStateRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 1800,
      startPos: camera.position.clone(),
      endPos,
      startQuat: camera.quaternion.clone(),
      endQuat,
      targetPoiId: flyToPoi.id,
    };

    radarPingRef.current = {
      poiId: flyToPoi.id,
      startTime: performance.now(),
      duration: 3000,
    };
  }, [flyToPoi]);

  // Handle View Mode Transition (First-Person <-> 3D Isometric Dollhouse)
  useEffect(() => {
    viewModeRef.current = viewMode;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const orbit = orbitControlsRef.current;
    const ceiling = ceilingMeshRef.current;
    if (!camera || !controls) return;

    // 1. Toggle Ceiling visibility (Ceiling hides in Dollhouse & Floorplan view for complete cutaway)
    const isOrbitView = viewMode === 'dollhouse' || viewMode === 'floorplan';
    if (ceiling) {
      ceiling.visible = !isOrbitView;
    }

    // 2. Toggle Billboard POI Badges (Visible in Dollhouse & Floorplan mode)
    if (poiBadgesRef.current) {
      poiBadgesRef.current.forEach((badge) => {
        badge.visible = isOrbitView;
      });
    }

    const now = performance.now();
    const eyeH = modeRef.current === 'wheelchair' ? 1.2 : 1.6;

    if (isOrbitView) {
      // Release pointer lock unconditionally
      if (controls.isLocked) {
        controls.unlock();
      }
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      if (orbit) {
        orbit.enabled = false;
      }

      // Save player standing position and forward view direction if coming from first-person
      if (viewTransitionRef.current.targetMode === 'first_person' || !viewTransitionRef.current.active) {
        lastPlayerPosRef.current.copy(camera.position);
        lastPlayerQuatRef.current.copy(camera.quaternion);
      }

      // Target camera pose
      let endPos;
      const dummy = new THREE.Object3D();
      if (viewMode === 'floorplan') {
        // Direct top-down architectural floorplan perspective
        endPos = new THREE.Vector3(0, 24, 0.01);
        dummy.position.copy(endPos);
        dummy.lookAt(0, 0, 0);
      } else {
        // Isometric dollhouse perspective
        endPos = new THREE.Vector3(0, 19, 19);
        dummy.position.copy(endPos);
        dummy.lookAt(0, 0.4, 0);
      }
      const endQuat = dummy.quaternion.clone();

      viewTransitionRef.current = {
        active: true,
        startTime: now,
        duration: 1100,
        startPos: camera.position.clone(),
        endPos,
        startQuat: camera.quaternion.clone(),
        endQuat,
        targetMode: viewMode,
      };
    } else {
      // Switching back to First-Person
      if (orbit) {
        orbit.enabled = false;
      }

      const returnPos = new THREE.Vector3(
        lastPlayerPosRef.current.x,
        eyeH,
        lastPlayerPosRef.current.z
      );
      const returnQuat = lastPlayerQuatRef.current.clone();

      viewTransitionRef.current = {
        active: true,
        startTime: now,
        duration: 1100,
        startPos: camera.position.clone(),
        endPos: returnPos,
        startQuat: camera.quaternion.clone(),
        endQuat: returnQuat,
        targetMode: 'first_person',
      };
    }
  }, [viewMode]);

  // Dynamic 3D Path Spline & Destination Floor Ripple Construction Helper
  const buildPathRibbon = useCallback((waypoints) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Dispose previous path meshes, outlines, textures, and anchor dots
    if (pathBaseOutlineRef.current) {
      scene.remove(pathBaseOutlineRef.current);
      pathBaseOutlineRef.current.geometry?.dispose();
      pathBaseOutlineRef.current.material?.dispose();
      pathBaseOutlineRef.current = null;
    }
    if (pathMeshRef.current) {
      scene.remove(pathMeshRef.current);
      pathMeshRef.current.geometry?.dispose();
      pathMeshRef.current.material?.dispose();
      pathMeshRef.current = null;
    }
    if (pathOutlinesRef.current && pathOutlinesRef.current.length > 0) {
      pathOutlinesRef.current.forEach((m) => {
        scene.remove(m);
        m.geometry?.dispose();
        m.material?.dispose();
      });
      pathOutlinesRef.current = [];
    }
    if (pathMeshesRef.current && pathMeshesRef.current.length > 0) {
      pathMeshesRef.current.forEach((m) => {
        scene.remove(m);
        m.geometry?.dispose();
        m.material?.dispose();
      });
      pathMeshesRef.current = [];
    }
    if (stairDotsRef.current && stairDotsRef.current.length > 0) {
      stairDotsRef.current.forEach((m) => {
        scene.remove(m);
        m.geometry?.dispose();
        m.material?.dispose();
      });
      stairDotsRef.current = [];
    }
    pathTexturesRef.current = [];

    if (destBeaconRef.current) {
      scene.remove(destBeaconRef.current);
      destBeaconRef.current.geometry?.dispose();
      destBeaconRef.current.material?.dispose();
      destBeaconRef.current = null;
    }
    if (destBadgeRef.current) {
      scene.remove(destBadgeRef.current);
      destBadgeRef.current.material?.dispose();
      destBadgeRef.current = null;
    }
    if (destRipplesRef.current) {
      destRipplesRef.current.forEach((r) => {
        scene.remove(r);
        r.geometry?.dispose();
        r.material?.dispose();
      });
      destRipplesRef.current = [];
    }

    if (!waypoints || waypoints.length < 2) {
      return;
    }

    const points = waypoints.map((p) => new THREE.Vector3(p.x, p.y + 0.04, p.z));
    if (points.length >= 2) {
      // Offset start point +0.4m along path direction towards the next waypoint so ribbon begins smoothly ahead of player
      const dir = new THREE.Vector3().subVectors(points[1], points[0]);
      if (dir.length() > 0.45) {
        dir.normalize();
        points[0].addScaledVector(dir, 0.4);
      }
    }
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');

    // Dense point sampling for continuous multi-surface classification
    const sampleCount = Math.max(40, points.length * 20);
    const densePoints = curve.getPoints(sampleCount);

    function getPointType(p) {
      // Ramp zone: X in [4.7, 7.3], Z in [-1.05, 3.25]
      if (p.x >= 4.7 && p.x <= 7.3 && p.z >= -1.05 && p.z <= 3.25) return 'ramp';
      // Stairs zone: X in [2.9, 4.7], Z in [-1.25, -0.05]
      if (p.x >= 2.9 && p.x <= 4.7 && p.z >= -1.25 && p.z <= -0.05) return 'stairs';
      return 'floor';
    }

    // Segment points into contiguous sub-curves with 1-point overlap for gap-free continuity
    const segments = [];
    let currentType = getPointType(densePoints[0]);
    let currentPoints = [densePoints[0]];

    for (let i = 1; i < densePoints.length; i++) {
      const pt = densePoints[i];
      const type = getPointType(pt);
      if (type === currentType) {
        currentPoints.push(pt);
      } else {
        currentPoints.push(pt); // overlap for seamless connection
        segments.push({ type: currentType, points: currentPoints });
        currentType = type;
        currentPoints = [pt];
      }
    }
    if (currentPoints.length > 1) {
      segments.push({ type: currentType, points: currentPoints });
    }

    const newMeshes = [];
    const newOutlines = [];
    const newTextures = [];
    let hasStairsSegment = false;

    segments.forEach((seg) => {
      if (seg.points.length < 2) return;
      const subCurve = new THREE.CatmullRomCurve3(seg.points, false, 'centripetal');
      const segTubes = Math.max(8, seg.points.length * 2);

      // 1. Charcoal Outline Tube (radius 0.068) so ribbon pops against bright floors
      const baseGeo = new THREE.TubeGeometry(subCurve, segTubes, 0.068, 8, false);
      const baseMat = new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      scene.add(baseMesh);
      newOutlines.push(baseMesh);

      // 2. High-Contrast Path Ribbon Tube
      const texture = createPathChevronTexture(seg.type);
      newTextures.push(texture);

      const radius = seg.type === 'ramp' ? 0.054 : 0.048;
      const tubeGeo = new THREE.TubeGeometry(subCurve, segTubes, radius, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      });
      const ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(ribbonMesh);
      newMeshes.push(ribbonMesh);

      if (seg.type === 'stairs') {
        hasStairsSegment = true;
      }
    });

    pathMeshesRef.current = newMeshes;
    pathOutlinesRef.current = newOutlines;
    pathTexturesRef.current = newTextures;
    if (newTextures.length > 0) {
      pathTextureRef.current = newTextures[0];
    }

    // Yellow Step Anchor Dots (rendered when routing over stairs in Standard Walk mode)
    const isWheelchair = modeRef.current === 'wheelchair';
    const newStairDots = [];

    if (!isWheelchair && hasStairsSegment) {
      const stairTreads = [
        { x: 3.8, y: 0.20 + 0.04, z: -0.30 },
        { x: 3.8, y: 0.40 + 0.04, z: -0.65 },
        { x: 3.8, y: 0.60 + 0.04, z: -1.00 },
      ];

      const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

      const ringGeo = new THREE.RingGeometry(0.07, 0.11, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xeab308,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });

      stairTreads.forEach((tread) => {
        const dotMesh = new THREE.Mesh(dotGeo, dotMat);
        dotMesh.position.set(tread.x, tread.y + 0.05, tread.z);
        scene.add(dotMesh);
        newStairDots.push(dotMesh);

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(tread.x, tread.y + 0.005, tread.z);
        scene.add(ringMesh);
        newStairDots.push(ringMesh);
      });
    }
    stairDotsRef.current = newStairDots;

    const lastPt = points[points.length - 1];

    // 1. Center Destination Target Disc
    const beaconGeo = new THREE.CircleGeometry(0.34, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: isWheelchair ? 0xc026d3 : 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.rotation.x = Math.PI / 2;
    beaconMesh.position.set(lastPt.x, lastPt.y + 0.012, lastPt.z);
    scene.add(beaconMesh);
    destBeaconRef.current = beaconMesh;

    // 2. Concentric Expanding Destination Floor Ripple Rings
    const ripples = [];
    for (let r = 0; r < 3; r++) {
      const rGeo = new THREE.RingGeometry(0.35, 0.44, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: isWheelchair ? 0xe879f9 : 0xfb7185,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = Math.PI / 2;
      rMesh.position.set(lastPt.x, lastPt.y + 0.015, lastPt.z);
      scene.add(rMesh);
      ripples.push(rMesh);
    }
    destRipplesRef.current = ripples;

    // 3. In-World Floating Marker: Floating deep indigo capsule badge over the destination
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 128;
    const bCtx = badgeCanvas.getContext('2d');

    // Deep Indigo capsule
    bCtx.fillStyle = '#1E1B4B';
    bCtx.beginPath();
    bCtx.roundRect(16, 16, 480, 96, 48);
    bCtx.fill();

    bCtx.strokeStyle = isWheelchair ? '#C026D3' : '#F43F5E';
    bCtx.lineWidth = 6;
    bCtx.beginPath();
    bCtx.roundRect(16, 16, 480, 96, 48);
    bCtx.stroke();

    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 36px Inter, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    const dTitle = navigationTargetPoiRef.current?.title || 'Destination';
    bCtx.fillText(`${dTitle} • 18 m • 2 min`, 256, 64);

    const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: badgeTexture, transparent: true });
    const badgeSprite = new THREE.Sprite(spriteMat);
    badgeSprite.position.set(lastPt.x, lastPt.y + 1.8, lastPt.z);
    badgeSprite.scale.set(1.8, 0.45, 1);
    scene.add(badgeSprite);
    destBadgeRef.current = badgeSprite;
  }, []);

  buildPathRibbonRef.current = buildPathRibbon;

  // React to route waypoints or accessibility mode changes
  useEffect(() => {
    liveWaypointsRef.current = activeRouteWaypoints ? [...activeRouteWaypoints] : null;
    buildPathRibbon(activeRouteWaypoints);
  }, [activeRouteWaypoints, buildPathRibbon, mode]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.025);
    sceneRef.current = scene;

    const initialHeight = modeRef.current === 'wheelchair' ? 1.2 : 1.6;
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, initialHeight, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);
    controlsRef.current = controls;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.08;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.08;
    orbitControls.minDistance = 6;
    orbitControls.maxDistance = 38;
    orbitControls.target.set(0, 0.4, 0);
    orbitControls.enabled = false;
    orbitControlsRef.current = orbitControls;

    const handleLock = () => onLockChangeRef.current?.(true);
    const handleUnlock = () => onLockChangeRef.current?.(false);

    controls.addEventListener('lock', handleLock);
    controls.addEventListener('unlock', handleUnlock);

    const env = buildAccessibleIndoorEnvironment(scene);
    ceilingMeshRef.current = env.ceiling;
    floorMeshRef.current = env.floorMesh;
    proceduralWallsRef.current = env.wallsGroup;
    stairsBarrierRef.current = env.stairsBarrier;
    if (stairsBarrierRef.current) {
      stairsBarrierRef.current.visible = modeRef.current === 'wheelchair';
    }
    elevatorCarRef.current = env.elevatorCar;

    // Initial setup with active POIs
    const initialPois = pois && pois.length > 0 ? pois : MOCK_POIS;
    const { poiObjects, hitTargets, badgeSprites } = build3DPois(scene, initialPois);
    poiObjectsRef.current = poiObjects;
    hitTargetsRef.current = hitTargets;
    badgeSpritesRef.current = badgeSprites;
    poiBadgesRef.current = badgeSprites;

    // 3D Real-Time Walking Floor Directional Pointer (0.85m project-ahead)
    const pointerGroup = new THREE.Group();
    pointerGroup.name = 'WalkingDirectionPointer';

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.32);
    arrowShape.lineTo(0.20, -0.16);
    arrowShape.lineTo(0.08, -0.10);
    arrowShape.lineTo(0.08, -0.25);
    arrowShape.lineTo(-0.08, -0.25);
    arrowShape.lineTo(-0.08, -0.10);
    arrowShape.lineTo(-0.20, -0.16);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const isWcInit = modeRef.current === 'wheelchair';
    const arrowMat = new THREE.MeshStandardMaterial({
      color: isWcInit ? 0xc026d3 : 0xf43f5e,
      emissive: isWcInit ? 0x8b5cf6 : 0xbe123c,
      emissiveIntensity: 0.9,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1,
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.rotation.x = -Math.PI / 2;
    pointerGroup.add(arrowMesh);

    const ringGeo = new THREE.RingGeometry(0.32, 0.40, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isWcInit ? 0xc026d3 : 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    pointerGroup.add(ringMesh);

    const coreGeo = new THREE.CircleGeometry(0.065, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.x = -Math.PI / 2;
    coreMesh.position.y = 0.002;
    pointerGroup.add(coreMesh);

    scene.add(pointerGroup);
    walkingPointerRef.current = { group: pointerGroup, arrowMesh, ringMesh };

    const onPointerDown = (e) => {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      if (viewModeRef.current !== 'dollhouse') return;
      const down = pointerDownPosRef.current;
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hitTargetsRef.current, false);
      for (const hit of intersects) {
        if (hit.object.userData?.poi) {
          onSelectPoiRef.current?.(hit.object.userData.poi);
          break;
        }
      }
    };

    const onPointerMove = (e) => {
      if (viewModeRef.current !== 'dollhouse') return;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hitTargetsRef.current, false);
      let hovering = false;
      for (const hit of intersects) {
        if (hit.object.userData?.poi) {
          hovering = true;
          break;
        }
      }
      renderer.domElement.style.cursor = hovering ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    let splatViewer = null;
    try {
      splatViewer = new GaussianSplats3D.Viewer({
        threeScene: scene,
        renderer: renderer,
        camera: camera,
        useBuiltInControls: false,
        selfDrivenMode: false,
        sharedMemoryForWorkers: false,
        gpuAcceleratedSort: true,
      });
      splatViewerRef.current = splatViewer;
    } catch (e) {
      console.warn('GaussianSplats3D fallback:', e);
      onStatusChangeRef.current?.({ type: 'error', message: 'Running procedural accessible twin engine.' });
    }

    // Trigger dynamic dataset loader (procedural showroom or remote 3DGS stream)
    triggerDatasetLoadRef.current?.();

    const keys = { forward: false, backward: false, left: false, right: false };

    const onKeyDown = (e) => {
      // If modal / UI overlay is active, ignore movement keys
      if (controls.isLocked) {
        switch (e.code) {
          case 'KeyW':
          case 'ArrowUp':
            keys.forward = true;
            break;
          case 'KeyS':
          case 'ArrowDown':
            keys.backward = true;
            break;
          case 'KeyA':
          case 'ArrowLeft':
            keys.left = true;
            break;
          case 'KeyD':
          case 'ArrowRight':
            keys.right = true;
            break;
          case 'KeyE':
            if (targetPoiRef.current) {
              controls.unlock();
              if (document.pointerLockElement) {
                document.exitPointerLock?.();
              }
              onSelectPoi?.(targetPoiRef.current);
            }
            break;
          case 'Escape':
            controls.unlock();
            break;
          default:
            break;
        }
      }
    };

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster();
    const centerScreen = new THREE.Vector2(0, 0);
    const cameraDir = new THREE.Vector3();

    const clock = new THREE.Clock();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    let frameCount = 0;
    let lastFpsTime = performance.now();
    let animationId = null;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const now = performance.now();

      // FPS tracking
      frameCount++;
      if (now - lastFpsTime >= 250) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        onFpsUpdateRef.current?.(fps);
        frameCount = 0;
        lastFpsTime = now;
      }

      // 1. View Mode Transition (First-Person <-> Dollhouse)
      if (viewTransitionRef.current.active) {
        const trans = viewTransitionRef.current;
        const progress = (now - trans.startTime) / trans.duration;

        if (progress < 1.0) {
          const t =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          camera.position.lerpVectors(trans.startPos, trans.endPos, t);
          camera.quaternion.slerpQuaternions(trans.startQuat, trans.endQuat, t);
        } else {
          camera.position.copy(trans.endPos);
          camera.quaternion.copy(trans.endQuat);
          trans.active = false;

          if (trans.targetMode === 'dollhouse' || trans.targetMode === 'floorplan') {
            const orbit = orbitControlsRef.current;
            if (orbit) {
              orbit.target.set(0, trans.targetMode === 'floorplan' ? 0 : 0.4, 0);
              orbit.enabled = true;
              orbit.update();
            }
          } else {
            const orbit = orbitControlsRef.current;
            if (orbit) orbit.enabled = false;
          }
        }
      } else if (viewModeRef.current === 'dollhouse' || viewModeRef.current === 'floorplan') {
        // OrbitControls is handling rotation, pan, zoom
        if (orbitControlsRef.current && orbitControlsRef.current.enabled) {
          orbitControlsRef.current.update();
        }
      } else if (flightStateRef.current.active) {
        // Camera Flyover Transition Handling
        const flight = flightStateRef.current;
        const progress = (now - flight.startTime) / flight.duration;

        if (progress < 1.0) {
          const t =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          camera.position.lerpVectors(flight.startPos, flight.endPos, t);
          camera.quaternion.slerpQuaternions(flight.startQuat, flight.endQuat, t);
        } else {
          camera.position.copy(flight.endPos);
          camera.quaternion.copy(flight.endQuat);
          flight.active = false;
        }
      } else if (controls.isLocked) {
        // Normal Roaming Movement & velocity
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.forward) - Number(keys.backward);
        direction.x = Number(keys.right) - Number(keys.left);
        direction.normalize();

        const isWheelchair = modeRef.current === 'wheelchair';
        const moveSpeed = isWheelchair ? 3.0 : 4.5;

        if (keys.forward || keys.backward) {
          velocity.z -= direction.z * moveSpeed * 10.0 * delta;
        }
        if (keys.left || keys.right) {
          velocity.x -= direction.x * moveSpeed * 10.0 * delta;
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Continuous Moving Elevator Cab inside shaft
        let cabCenterY = 5.15;
        if (elevatorCarRef.current) {
          // Traverses smoothly between Floor 0 (center y=1.15) and Floor 2 (center y=9.15)
          cabCenterY = 5.15 + Math.sin(elapsed * 0.55) * 4.0;
          elevatorCarRef.current.position.y = cabCenterY;
        }
        const cabFloorSurfaceY = cabCenterY - 1.15;

        // Camera Eye-height Locking & Multi-Floor Elevation Physics
        const eyeHeight = modeRef.current === 'wheelchair' ? 1.2 : 1.6;

        // Check if player is inside elevator cab footprint (x in [-7.1, -4.9], z in [-7.1, -4.9])
        const inElevatorZone =
          Math.abs(camera.position.x - (-6.0)) <= 1.1 &&
          Math.abs(camera.position.z - (-6.0)) <= 1.1;

        // Check if player is traversing Flight 1 stairs (Ground to Mezzanine)
        const onStairsFlight1 =
          camera.position.x >= 2.9 &&
          camera.position.x <= 4.7 &&
          camera.position.z >= -1.8 &&
          camera.position.z <= 3.4;

        // Check if player is traversing Flight 2 stairs (Mezzanine to Terrace)
        const onStairsFlight2 =
          camera.position.x >= 2.9 &&
          camera.position.x <= 4.7 &&
          camera.position.z >= -3.4 &&
          camera.position.z <= 1.8 &&
          camera.position.y >= 3.6;

        if (inElevatorZone) {
          // Riding the moving elevator cab!
          camera.position.y = cabFloorSurfaceY + eyeHeight;

          let detectedFloor = 0;
          if (cabFloorSurfaceY >= 6.0) detectedFloor = 2;
          else if (cabFloorSurfaceY >= 2.0) detectedFloor = 1;
          else detectedFloor = 0;

          if (currentFloorLevelRef.current !== detectedFloor) {
            currentFloorLevelRef.current = detectedFloor;
            onFloorChangeRef.current?.(detectedFloor);
          }
        } else if (onStairsFlight1 && modeRef.current !== 'wheelchair') {
          // Physical climbing Flight 1 (Ground -> Mezzanine, y=0 to y=4.0m)
          const t = Math.max(0, Math.min(1, (3.2 - camera.position.z) / 4.8));
          const stairSurfaceY = t * 4.0;
          camera.position.y = stairSurfaceY + eyeHeight;

          if (camera.position.z <= -1.4 && currentFloorLevelRef.current !== 1) {
            currentFloorLevelRef.current = 1;
            onFloorChangeRef.current?.(1);
          } else if (camera.position.z >= 3.0 && currentFloorLevelRef.current !== 0) {
            currentFloorLevelRef.current = 0;
            onFloorChangeRef.current?.(0);
          }
        } else if (onStairsFlight2 && modeRef.current !== 'wheelchair') {
          // Physical climbing Flight 2 (Mezzanine -> Terrace, y=4.0 to y=8.0m)
          const t = Math.max(0, Math.min(1, (camera.position.z - (-3.2)) / 4.8));
          const stairSurfaceY = 4.0 + t * 4.0;
          camera.position.y = stairSurfaceY + eyeHeight;

          if (camera.position.z >= 1.4 && currentFloorLevelRef.current !== 2) {
            currentFloorLevelRef.current = 2;
            onFloorChangeRef.current?.(2);
          } else if (camera.position.z <= -3.0 && currentFloorLevelRef.current !== 1) {
            currentFloorLevelRef.current = 1;
            onFloorChangeRef.current?.(1);
          }
        } else {
          // Normal floor plate elevation
          const baseElevation = currentFloorLevelRef.current * 4.0;
          let surfaceOffset = 0;
          if (currentFloorLevelRef.current === 0) {
            if (camera.position.x >= 3.0 && camera.position.x <= 9.0 && camera.position.z >= -9.0 && camera.position.z <= -1.0) {
              surfaceOffset = 0.6;
            } else if (camera.position.x >= 4.8 && camera.position.x <= 7.2 && camera.position.z >= -1.0 && camera.position.z <= 3.2) {
              const t = (3.2 - camera.position.z) / 4.2;
              surfaceOffset = Math.max(0, Math.min(0.6, t * 0.6));
            }
          }
          const targetHeight = baseElevation + surfaceOffset + eyeHeight;

          if (floorTransitionRef.current?.active) {
            const trans = floorTransitionRef.current;
            const el = performance.now() - trans.startTime;
            const t = Math.min(1.0, el / trans.duration);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            camera.position.y = trans.startY + (trans.targetY - trans.startY) * ease;
            if (t >= 1.0) {
              floorTransitionRef.current.active = false;
            }
          } else {
            camera.position.y += (targetHeight - camera.position.y) * Math.min(delta * 12.0, 1.0);
          }
        }
      }

      // Animate 3D Real-Time Walking Floor Directional Pointer (0.85m project-ahead)
      if (walkingPointerRef.current) {
        const { group, ringMesh, arrowMesh } = walkingPointerRef.current;
        if (viewModeRef.current === 'first_person') {
          group.visible = true;
          camera.getWorldDirection(cameraDir);
          const fwdX = cameraDir.x;
          const fwdZ = cameraDir.z;
          const hLen = Math.hypot(fwdX, fwdZ) || 1;
          const normX = fwdX / hLen;
          const normZ = fwdZ / hLen;

          const ptrX = camera.position.x + normX * 0.85;
          const ptrZ = camera.position.z + normZ * 0.85;
          const eyeH = modeRef.current === 'wheelchair' ? 1.2 : 1.6;
          const floorY = camera.position.y - eyeH;
          group.position.set(ptrX, floorY + 0.04, ptrZ);

          const headingYaw = Math.atan2(normX, normZ);
          group.rotation.y = headingYaw;

          const ringPulse = 1.0 + Math.sin(elapsed * 4.5) * 0.22;
          ringMesh.scale.set(ringPulse, ringPulse, ringPulse);
          ringMesh.material.opacity = 0.45 + Math.sin(elapsed * 4.5) * 0.3;

          const isWc = modeRef.current === 'wheelchair';
          const targetHex = isWc ? 0xc026d3 : 0xf43f5e;
          arrowMesh.material.color.setHex(targetHex);
          arrowMesh.material.emissive.setHex(isWc ? 0x8b5cf6 : 0xbe123c);
          ringMesh.material.color.setHex(targetHex);
        } else {
          group.visible = false;
        }
      }

      // Real-Time Waypoint Progression & Dynamic Path Ribbon Trimming
      if (liveWaypointsRef.current && liveWaypointsRef.current.length >= 2) {
        const headPt = liveWaypointsRef.current[0];
        const distToHead = Math.hypot(
          camera.position.x - headPt.x,
          camera.position.z - headPt.z
        );

        if (distToHead <= 1.2 && liveWaypointsRef.current.length > 1) {
          liveWaypointsRef.current.shift();
          buildPathRibbonRef.current?.(liveWaypointsRef.current);

          let remainingDist = Math.hypot(
            camera.position.x - liveWaypointsRef.current[0].x,
            camera.position.z - liveWaypointsRef.current[0].z
          );
          for (let i = 0; i < liveWaypointsRef.current.length - 1; i++) {
            remainingDist += Math.hypot(
              liveWaypointsRef.current[i + 1].x - liveWaypointsRef.current[i].x,
              liveWaypointsRef.current[i + 1].z - liveWaypointsRef.current[i].z
            );
          }
          onRouteProgressRef.current?.([...liveWaypointsRef.current], remainingDist);
        }
      }

      // Orientation & Minimap Sync (passes standing player coords in first-person, or last standing in dollhouse)
      if (viewModeRef.current === 'first_person') {
        camera.getWorldDirection(cameraDir);
        const yaw = Math.atan2(cameraDir.x, -cameraDir.z);
        onPlayerMoveRef.current?.(camera.position.x, camera.position.z, yaw, camera.position.y, cameraDir.x, cameraDir.z);
      }

      // Raycasting (only active while pointer is locked to avoid interfering with UI)
      if (controls.isLocked) {
        raycaster.setFromCamera(centerScreen, camera);
        const intersects = raycaster.intersectObjects(hitTargetsRef.current, false);
        let currentTarget = null;

        for (const hit of intersects) {
          if (hit.distance <= 7.5 && hit.object.userData?.poi) {
            currentTarget = hit.object.userData.poi;
            break;
          }
        }

        if (currentTarget?.id !== targetPoiRef.current?.id) {
          targetPoiRef.current = currentTarget;
          onTargetPoiRef.current?.(currentTarget);
        }
      } else if (targetPoiRef.current) {
        targetPoiRef.current = null;
        onTargetPoiRef.current?.(null);
      }

      // Radar Ping Animation check
      const isPingActive = now - radarPingRef.current.startTime < radarPingRef.current.duration;
      const pingPoiId = isPingActive ? radarPingRef.current.poiId : null;

      // Animate POI Pins & Radar Pings
      poiObjectsRef.current.forEach((item, index) => {
        const isTargeted = targetPoiRef.current?.id === item.poi.id;
        const isPinged = pingPoiId === item.poi.id;

        const floatOffset = Math.sin(elapsed * 2.5 + index) * 0.08;
        item.group.position.y = item.initialY + floatOffset;

        const spinSpeed = isPinged ? 5.0 : isTargeted ? 3.0 : 1.5;
        item.outerMesh.rotation.y = elapsed * spinSpeed;
        item.outerMesh.rotation.x = elapsed * 0.8;

        const targetScale = isPinged ? 1.45 : isTargeted ? 1.3 : 1.0;
        item.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);

        const ringScale = 1.0 + Math.sin(elapsed * 3 + index) * 0.15;
        item.ringMesh.scale.set(ringScale, ringScale, ringScale);

        // Concentric Expanding Radar Pings
        if (item.pingRings) {
          item.pingRings.forEach((pMesh, rIdx) => {
            if (isPinged) {
              const pingAge = (now - radarPingRef.current.startTime) / 1000;
              const phase = (pingAge * 1.5 + rIdx * 0.33) % 1.0;
              const rScale = 1.0 + phase * 4.5;
              const rOpacity = (1.0 - phase) * 0.85;

              pMesh.scale.set(rScale, rScale, rScale);
              pMesh.material.opacity = rOpacity;
            } else {
              pMesh.material.opacity = 0.0;
            }
          });
        }
      });

      // Animate 3D Spline Path Flow (all segmented path textures)
      if (pathTexturesRef.current && pathTexturesRef.current.length > 0) {
        pathTexturesRef.current.forEach((tex) => {
          if (tex) tex.offset.x -= delta * 1.5;
        });
      } else if (pathTextureRef.current) {
        pathTextureRef.current.offset.x -= delta * 1.5;
      }

      // Animate Wheelchair stairs barrier floating bob
      if (stairsBarrierRef.current && stairsBarrierRef.current.visible) {
        stairsBarrierRef.current.position.y = 1.25 + Math.sin(elapsed * 3.2) * 0.035;
      }
      if (destBeaconRef.current) {
        const bScale = 1.0 + Math.sin(elapsed * 4) * 0.15;
        destBeaconRef.current.scale.set(bScale, bScale, bScale);
      }
      if (destRipplesRef.current && destRipplesRef.current.length > 0) {
        destRipplesRef.current.forEach((rMesh, rIdx) => {
          const phase = (elapsed * 0.9 + rIdx * 0.333) % 1.0;
          const rScale = 1.0 + phase * 4.8;
          const rOpacity = Math.sin((1.0 - phase) * Math.PI * 0.5) * 0.75;
          rMesh.scale.set(rScale, rScale, rScale);
          rMesh.material.opacity = rOpacity;
        });
      }

      // Render
      if (splatViewerRef.current && isSplatLoadedRef.current) {
        try {
          splatViewerRef.current.update();
          splatViewerRef.current.render();
        } catch (e) {
          renderer.render(scene, camera);
        }
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      controls.removeEventListener('lock', handleLock);
      controls.removeEventListener('unlock', handleUnlock);
      controls.dispose();

      orbitControls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);

      if (splatViewerRef.current) {
        try {
          splatViewerRef.current.dispose();
        } catch (e) {}
      }

      if (walkingPointerRef.current?.group) {
        scene.remove(walkingPointerRef.current.group);
      }

      if (destBadgeRef.current) {
        scene.remove(destBadgeRef.current);
        destBadgeRef.current.material?.dispose();
        destBadgeRef.current = null;
      }

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Click on canvas triggers cursor lock (ONLY in first-person and when no UI overlay is active)
  const handleCanvasClick = useCallback(() => {
    // If any modal, palette, or drawer is active, do not lock
    if (isOverlayActive) return;
    if (viewModeRef.current === 'dollhouse' || viewModeRef.current === 'floorplan') return; // In orbit modes, OrbitControls handles mouse drag/click

    if (
      controlsRef.current &&
      !controlsRef.current.isLocked &&
      !flightStateRef.current.active &&
      !viewTransitionRef.current.active
    ) {
      controlsRef.current.lock();
    } else if (targetPoiRef.current && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      onSelectPoi?.(targetPoiRef.current);
    }
  }, [isOverlayActive, onSelectPoi]);

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      className="splat-canvas-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isOverlayActive ? 'default' : (viewMode === 'dollhouse' || viewMode === 'floorplan') ? 'grab' : 'pointer',
      }}
    />
  );
}
