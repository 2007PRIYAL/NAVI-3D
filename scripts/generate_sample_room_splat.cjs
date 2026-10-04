const fs = require('fs');
const path = require('path');
const GS = require('@mkkellogg/gaussian-splats-3d');

function generateSampleRoomSplat() {
  const splats = [];

  // Helper to add a splat
  function addSplat(x, y, z, sx, sy, sz, r, g, b, a = 255) {
    splats.push({ x, y, z, sx, sy, sz, r, g, b, a });
  }

  // 1. Floor plane: x in [-14, 14], z in [-12, 12]
  for (let x = -13.8; x <= 13.8; x += 0.35) {
    for (let z = -11.8; z <= 11.8; z += 0.35) {
      const isTactile = Math.abs(x - (-1.5)) < 0.45;
      const inDeck = x >= 3.0 && x <= 9.0 && z >= -9.0 && z <= -1.0;
      const inRamp = x >= 4.8 && x <= 7.2 && z >= -1.0 && z <= 3.2;

      if (inDeck || inRamp) continue; // handeled separately

      if (isTactile) {
        // High contrast yellow tactile strip
        addSplat(
          x + (Math.random() - 0.5) * 0.08,
          0.02 + Math.random() * 0.01,
          z + (Math.random() - 0.5) * 0.08,
          0.12, 0.04, 0.12,
          245 + Math.floor(Math.random() * 10),
          158 + Math.floor(Math.random() * 30),
          11,
          255
        );
      } else {
        // Tile floor (slate blue alternating pattern)
        const tileCheck = ((Math.floor(x) + Math.floor(z)) % 2 === 0);
        const r = tileCheck ? 28 : 20;
        const g = tileCheck ? 38 : 30;
        const b = tileCheck ? 56 : 45;
        addSplat(
          x + (Math.random() - 0.5) * 0.1,
          0.005 + Math.random() * 0.005,
          z + (Math.random() - 0.5) * 0.1,
          0.22, 0.05, 0.22,
          r, g, b, 235
        );
      }
    }
  }

  // 2. Elevated Platform Deck: x in [3.0, 9.0], z in [-9.0, -1.0] at y = 0.65
  for (let x = 3.1; x <= 8.9; x += 0.28) {
    for (let z = -8.9; z <= -1.1; z += 0.28) {
      addSplat(
        x + (Math.random() - 0.5) * 0.06,
        0.65 + Math.random() * 0.01,
        z + (Math.random() - 0.5) * 0.06,
        0.18, 0.05, 0.18,
        180 + Math.floor(Math.random() * 30),
        130 + Math.floor(Math.random() * 20),
        85,
        245
      );
    }
  }
  // Deck perimeter edge splats (cyan edge trim)
  for (let x = 3.0; x <= 9.0; x += 0.2) {
    addSplat(x, 0.66, -1.0, 0.12, 0.08, 0.12, 6, 182, 212, 255);
    addSplat(x, 0.66, -9.0, 0.12, 0.08, 0.12, 6, 182, 212, 255);
  }
  for (let z = -9.0; z <= -1.0; z += 0.2) {
    addSplat(3.0, 0.66, z, 0.12, 0.08, 0.12, 6, 182, 212, 255);
    addSplat(9.0, 0.66, z, 0.12, 0.08, 0.12, 6, 182, 212, 255);
  }

  // 3. ADA Ramp: x in [4.8, 7.2], z from 3.2 (y = 0.05) to -1.0 (y = 0.65)
  for (let z = -1.0; z <= 3.2; z += 0.18) {
    const t = 1 - (z - (-1.0)) / (3.2 - (-1.0)); // 0 at z=3.2, 1 at z=-1.0
    const ySlope = 0.05 + t * 0.60;
    for (let x = 4.8; x <= 7.2; x += 0.25) {
      addSplat(
        x + (Math.random() - 0.5) * 0.05,
        ySlope + Math.random() * 0.01,
        z + (Math.random() - 0.5) * 0.05,
        0.18, 0.06, 0.18,
        14, 165, 233, 255 // Vibrant accessible cyan
      );
    }
    // Ramp handrails splats
    addSplat(4.75, ySlope + 0.9, z, 0.06, 0.06, 0.15, 224, 242, 254, 255);
    addSplat(7.25, ySlope + 0.9, z, 0.06, 0.06, 0.15, 224, 242, 254, 255);
  }

  // 4. North Wall (z = -12)
  for (let x = -13.8; x <= 13.8; x += 0.4) {
    for (let y = 0.3; y <= 4.2; y += 0.35) {
      addSplat(
        x + (Math.random() - 0.5) * 0.08,
        y + (Math.random() - 0.5) * 0.08,
        -12.0 + Math.random() * 0.05,
        0.24, 0.24, 0.08,
        22, 32, 50, 240
      );
    }
  }

  // 5. South Wall (z = 12) with entrance opening x in [-2, 2]
  for (let x = -13.8; x <= 13.8; x += 0.4) {
    if (Math.abs(x) < 2.2) continue; // door opening
    for (let y = 0.3; y <= 4.2; y += 0.35) {
      addSplat(
        x + (Math.random() - 0.5) * 0.08,
        y + (Math.random() - 0.5) * 0.08,
        12.0 - Math.random() * 0.05,
        0.24, 0.24, 0.08,
        22, 32, 50, 240
      );
    }
  }

  // 6. West Wall (x = -14)
  for (let z = -11.8; z <= 11.8; z += 0.4) {
    for (let y = 0.3; y <= 4.2; y += 0.35) {
      addSplat(
        -14.0 + Math.random() * 0.05,
        y + (Math.random() - 0.5) * 0.08,
        z + (Math.random() - 0.5) * 0.08,
        0.08, 0.24, 0.24,
        24, 34, 54, 240
      );
    }
  }

  // 7. East Wall (x = 14)
  for (let z = -11.8; z <= 11.8; z += 0.4) {
    for (let y = 0.3; y <= 4.2; y += 0.35) {
      addSplat(
        14.0 - Math.random() * 0.05,
        y + (Math.random() - 0.5) * 0.08,
        z + (Math.random() - 0.5) * 0.08,
        0.08, 0.24, 0.24,
        24, 34, 54, 240
      );
    }
  }

  // 8. 6 Columns at x = +/- 6, z in [-8, 0, 8]
  const columnPositions = [
    [-6, -8], [-6, 0], [-6, 8],
    [6, -8], [6, 0], [6, 8],
  ];
  for (const [cx, cz] of columnPositions) {
    for (let y = 0.2; y <= 4.3; y += 0.25) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const px = cx + Math.cos(angle) * 0.35;
        const pz = cz + Math.sin(angle) * 0.35;
        addSplat(
          px, y, pz,
          0.14, 0.14, 0.14,
          (y > 2.0 && y < 2.3) ? 6 : 40,
          (y > 2.0 && y < 2.3) ? 182 : 55,
          (y > 2.0 && y < 2.3) ? 212 : 75,
          255
        );
      }
    }
  }

  // 9. Ceiling LED light fixtures at y = 4.4
  for (let z = -10; z <= 10; z += 0.3) {
    addSplat(-4, 4.4, z, 0.18, 0.05, 0.18, 250, 250, 255, 255);
    addSplat(4, 4.4, z, 0.18, 0.05, 0.18, 250, 250, 255, 255);
  }

  console.log(`Generated ${splats.length} 3D Gaussian Splats.`);

  // Write binary .splat file (32 bytes per splat)
  const buffer = Buffer.alloc(splats.length * 32);
  for (let i = 0; i < splats.length; i++) {
    const s = splats[i];
    const offset = i * 32;

    // Position (float32 x 3)
    buffer.writeFloatLE(s.x, offset + 0);
    buffer.writeFloatLE(s.y, offset + 4);
    buffer.writeFloatLE(s.z, offset + 8);

    // Scale (float32 x 3)
    buffer.writeFloatLE(s.sx, offset + 12);
    buffer.writeFloatLE(s.sy, offset + 16);
    buffer.writeFloatLE(s.sz, offset + 20);

    // Color (uint8 x 4: r, g, b, a)
    buffer[offset + 24] = Math.min(255, Math.max(0, Math.round(s.r)));
    buffer[offset + 25] = Math.min(255, Math.max(0, Math.round(s.g)));
    buffer[offset + 26] = Math.min(255, Math.max(0, Math.round(s.b)));
    buffer[offset + 27] = Math.min(255, Math.max(0, Math.round(s.a)));

    // Rotation (uint8 x 4: w, x, y, z identity quat normalized to 128 offset)
    buffer[offset + 28] = 255; // w: (255-128)/128 ~ 0.99
    buffer[offset + 29] = 128; // x: 0
    buffer[offset + 30] = 128; // y: 0
    buffer[offset + 31] = 128; // z: 0
  }

  const outPath = path.join(__dirname, '..', 'public', 'models', 'sample_room.splat');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved sample_room.splat to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  // Verify parsing with GaussianSplats3D
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const splatArray = GS.SplatParser.parseStandardSplatToUncompressedSplatArray(ab, 0, 1);
  console.log(`Verification: GaussianSplats3D successfully parsed ${splatArray.splatCount} splats!`);
}

generateSampleRoomSplat();
