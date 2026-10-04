import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { POI_CATEGORIES } from '../data/mockPois';

const Minimap = forwardRef(function Minimap(
  {
    pois = [],
    selectedPoi,
    targetPoi,
    activeRouteWaypoints = null,
    mode = 'walk',
    bounds = null,
    onSelectPoi,
    zoom = 1,
    currentFloorLevel = 0,
  },
  ref
) {
  const canvasRef = useRef(null);
  const playerStateRef = useRef({ x: 0, z: 5, yaw: 0 });
  const animFrameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePlayer(x, z, yaw) {
      playerStateRef.current.x = x;
      playerStateRef.current.z = z;
      playerStateRef.current.yaw = yaw;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const spanX = bounds ? bounds.maxX - bounds.minX : 28;
    const spanZ = bounds ? bounds.maxZ - bounds.minZ : 23;
    const maxSpan = Math.max(spanX, spanZ, 12);
    const scale = ((width - 34) / maxSpan) * (zoom || 1);
    const offsetX = bounds ? (bounds.minX + bounds.maxX) / 2 : 0;
    const offsetZ = bounds ? (bounds.minZ + bounds.maxZ) / 2 : 0;

    const worldToCanvas = (wx, wz) => ({
      cx: centerX + (wx - offsetX) * scale,
      cy: centerY + (wz - offsetZ) * scale,
    });

    let radarAngle = 0;

    const render = () => {
      radarAngle += 0.03;

      // 1. Clear background
      ctx.clearRect(0, 0, width, height);

      // Save context for circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, width / 2 - 4, 0, Math.PI * 2);
      ctx.clip();

      // Dark slate / blueprint map background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Subtle range rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let r = 25; r < width / 2; r += 25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // 2. Room Geometry (Multi-Storey Architectural Twin)
      const p1 = worldToCanvas(-14, -11.5);
      const p2 = worldToCanvas(14, 11.5);

      // Base walkable floor plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p1.cx, p1.cy, p2.cx - p1.cx, p2.cy - p1.cy);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(p1.cx, p1.cy, p2.cx - p1.cx, p2.cy - p1.cy);

      // --- LEVEL 0: Ground Floor Features ---
      if (currentFloorLevel === 0) {
        // Elevated accessible deck (X: 3 to 9, Z: -9 to -1)
        const deck1 = worldToCanvas(3, -9);
        const deck2 = worldToCanvas(9, -1);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(deck1.cx, deck1.cy, deck2.cx - deck1.cx, deck2.cy - deck1.cy);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(deck1.cx, deck1.cy, deck2.cx - deck1.cx, deck2.cy - deck1.cy);

        // Accessible Ramp Zone (X: 4.8 to 7.2, Z: -1.0 to 3.2)
        const ramp1 = worldToCanvas(4.8, -1.0);
        const ramp2 = worldToCanvas(7.2, 3.2);
        const rX = Math.min(ramp1.cx, ramp2.cx);
        const rY = Math.min(ramp1.cy, ramp2.cy);
        const rW = Math.abs(ramp2.cx - ramp1.cx);
        const rH = Math.abs(ramp2.cy - ramp1.cy);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(rX, rY, rW, rH);
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(rX, rY, rW, rH);

        // Ramp tactile transition warning strips (entry and exit)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(rX, rY + rH - 3, rW, 3);
        ctx.fillRect(rX, rY, rW, 3);

        // Directional upward chevrons indicating incline ascent towards deck
        ctx.save();
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const chevronGap = rH / 4;
        const chevronSpan = Math.min(rW * 0.32, 9);
        for (let a = 1; a <= 3; a++) {
          const cY = rY + a * chevronGap;
          ctx.beginPath();
          ctx.moveTo(rX + rW / 2 - chevronSpan, cY + 4);
          ctx.lineTo(rX + rW / 2, cY - 4);
          ctx.lineTo(rX + rW / 2 + chevronSpan, cY + 4);
          ctx.stroke();
        }
        ctx.restore();

        // Tactile strip (X: -1.5, Z: -11 to 11)
        const tac1 = worldToCanvas(-1.5, -11);
        const tac2 = worldToCanvas(-1.5, 11);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(tac1.cx, tac1.cy);
        ctx.lineTo(tac2.cx, tac2.cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground Columns
        ctx.fillStyle = '#1e293b';
        const colCoords = [
          [-6, -8], [-6, 0], [-6, 8],
          [6, -8], [6, 8]
        ];
        colCoords.forEach(([colX, colZ]) => {
          const c = worldToCanvas(colX, colZ);
          ctx.beginPath();
          ctx.arc(c.cx, c.cy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // --- LEVEL 1: Mezzanine Level Features ---
      if (currentFloorLevel === 1) {
        // Central Open Atrium Void (Cutout looking down to Level 0)
        const av1 = worldToCanvas(-3.2, -3.2);
        const av2 = worldToCanvas(3.2, 3.2);
        const avX = Math.min(av1.cx, av2.cx);
        const avY = Math.min(av1.cy, av2.cy);
        const avW = Math.abs(av2.cx - av1.cx);
        const avH = Math.abs(av2.cy - av1.cy);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(avX, avY, avW, avH);

        // Void perimeter safety railing (Solid Blue with dashed border)
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(avX, avY, avW, avH);

        // Atrium Void label
        ctx.fillStyle = '#2563eb';
        ctx.font = '700 8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ATRIUM VOID', avX + avW / 2, avY + avH / 2 + 3);
      }

      // --- LEVEL 2: Terrace Deck Features ---
      if (currentFloorLevel === 2) {
        // Open-air Terrace Balustrade Perimeter
        const tp1 = worldToCanvas(-12, -9.5);
        const tp2 = worldToCanvas(12, 9.5);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(tp1.cx, tp1.cy, tp2.cx - tp1.cx, tp2.cy - tp1.cy);
        ctx.setLineDash([]);

        // Rooftop pergola & observation labels
        const obsCenter = worldToCanvas(0, -6);
        ctx.fillStyle = '#0369a1';
        ctx.font = '700 8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OBSERVATION DECK', obsCenter.cx, obsCenter.cy);
      }

      // --- VERTICAL CONNECTORS (Rendered on all floor levels) ---
      // 1. Enclosed Braille Elevator Shaft Tower at (-6.0, -6.0)
      const elevCenter = worldToCanvas(-6.0, -6.0);
      const elevSize = 14;
      ctx.fillStyle = '#ecfeff'; // Cyan tint
      ctx.fillRect(elevCenter.cx - elevSize / 2, elevCenter.cy - elevSize / 2, elevSize, elevSize);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(elevCenter.cx - elevSize / 2, elevCenter.cy - elevSize / 2, elevSize, elevSize);
      ctx.fillStyle = '#0284c7';
      ctx.font = '800 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LIFT', elevCenter.cx, elevCenter.cy + 2.5);

      // 2. Central Stairs Flight (at x=3.0 to 4.6, z=-1.15 to -0.1)
      const stair1 = worldToCanvas(3.0, -1.15);
      const stair2 = worldToCanvas(4.6, -0.1);
      const sX = Math.min(stair1.cx, stair2.cx);
      const sY = Math.min(stair1.cy, stair2.cy);
      const sW = Math.abs(stair2.cx - stair1.cx);
      const sH = Math.abs(stair2.cy - stair1.cy);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sX, sY, sW, sH);

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      const stepInterval = sH / 3;
      for (let s = 1; s <= 3; s++) {
        const lineY = sY + (s - 0.5) * stepInterval;
        ctx.beginPath();
        ctx.moveTo(sX + 1, lineY);
        ctx.lineTo(sX + sW - 1, lineY);
        ctx.stroke();
      }

      ctx.strokeStyle = mode === 'wheelchair' ? '#ef4444' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sX, sY, sW, sH);

      // Wheelchair mode: diagonal red hatch barrier across stairs
      if (mode === 'wheelchair') {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sX + 2, sY + 2);
        ctx.lineTo(sX + sW - 2, sY + sH - 2);
        ctx.moveTo(sX + sW - 2, sY + 2);
        ctx.lineTo(sX + 2, sY + sH - 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Dynamic Active Path Navigation Trail
      if (activeRouteWaypoints && activeRouteWaypoints.length >= 2) {
        ctx.save();
        const isWheelchair = mode === 'wheelchair';
        const routeColor = isWheelchair ? '#C026D3' : '#E11D48';

        ctx.strokeStyle = routeColor;
        ctx.lineWidth = 3.0;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        activeRouteWaypoints.forEach((pt, idx) => {
          const { cx, cy } = worldToCanvas(pt.x, pt.z);
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();

        // Draw Waypoint dots along the route
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = routeColor;
        ctx.lineWidth = 1.5;
        activeRouteWaypoints.forEach((pt) => {
          const { cx, cy } = worldToCanvas(pt.x, pt.z);
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. POI Markers with Floor-Aware Highlighting
      pois.forEach((poi) => {
        const { cx, cy } = worldToCanvas(poi.position[0], poi.position[2]);
        const catInfo = POI_CATEGORIES[poi.category] || POI_CATEGORIES.service;
        const isTargeted = targetPoi?.id === poi.id;
        const isSelected = selectedPoi?.id === poi.id;
        const isOnActiveFloor = (poi.floor ?? 0) === currentFloorLevel;

        ctx.save();
        if (!isOnActiveFloor) {
          ctx.globalAlpha = 0.35; // Dim ghost dots on other floors
        }

        if (isTargeted || isSelected) {
          ctx.strokeStyle = catInfo.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 8 + Math.sin(radarAngle * 3) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crisp outer rim
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, isTargeted ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Color core
        ctx.fillStyle = catInfo.color;
        ctx.beginPath();
        ctx.arc(cx, cy, isTargeted ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 5. Player Avatar: Vibrant Electric Blue cone with white core dot and pulsing ring
      const { x: px, z: pz, yaw } = playerStateRef.current;
      const playerPos = worldToCanvas(px, pz);

      const coneLength = 32;
      const fovHalfAngle = (35 * Math.PI) / 180;
      const leftAngle = yaw - fovHalfAngle;
      const rightAngle = yaw + fovHalfAngle;

      const leftX = playerPos.cx + Math.sin(leftAngle) * coneLength;
      const leftY = playerPos.cy - Math.cos(leftAngle) * coneLength;
      const rightX = playerPos.cx + Math.sin(rightAngle) * coneLength;
      const rightY = playerPos.cy - Math.cos(rightAngle) * coneLength;

      // Vibrant Fuchsia/Coral cone gradient
      const coneGrad = ctx.createRadialGradient(
        playerPos.cx,
        playerPos.cy,
        2,
        playerPos.cx,
        playerPos.cy,
        coneLength
      );
      coneGrad.addColorStop(0, 'rgba(192, 38, 211, 0.45)');
      coneGrad.addColorStop(0.8, 'rgba(244, 63, 94, 0.15)');
      coneGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(playerPos.cx, playerPos.cy);
      ctx.lineTo(leftX, leftY);
      ctx.arc(playerPos.cx, playerPos.cy, coneLength, -Math.PI / 2 + leftAngle, -Math.PI / 2 + rightAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#C026D3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playerPos.cx, playerPos.cy);
      ctx.lineTo(leftX, leftY);
      ctx.moveTo(playerPos.cx, playerPos.cy);
      ctx.lineTo(rightX, rightY);
      ctx.stroke();

      // 5. Player Avatar: High-contrast Glowing Directional Arrow with Pulsing Aura Ring
      const isWc = mode === 'wheelchair';
      const playerColor = isWc ? '#C026D3' : '#F43F5E';
      const pulseColor = isWc ? 'rgba(192, 38, 211, 0.45)' : 'rgba(244, 63, 94, 0.45)';

      // Active pulsing radar aura ring
      const pulseRadius = 9 + Math.sin(radarAngle * 4) * 3;
      ctx.strokeStyle = pulseColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(playerPos.cx, playerPos.cy, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Sharp glowing directional navigation arrow
      ctx.save();
      ctx.translate(playerPos.cx, playerPos.cy);
      ctx.rotate(yaw);

      // Arrow polygon pointing along forward heading
      ctx.beginPath();
      ctx.moveTo(0, -11.5); // Arrow tip
      ctx.lineTo(6.5, 6.5);  // Right wing
      ctx.lineTo(0, 3.0);    // Inner notch
      ctx.lineTo(-6.5, 6.5); // Left wing
      ctx.closePath();

      // Luminous shadow glow
      ctx.shadowColor = playerColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = playerColor;
      ctx.fill();

      // Crisp white outline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // White core position dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 1.2, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();

      // Outer bezel ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, width / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Compass North Marker
      ctx.fillStyle = '#FB923C';
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('N', centerX, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [pois, selectedPoi, targetPoi, activeRouteWaypoints, mode, bounds, zoom]);

  const handleCanvasClick = (e) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const spanX = bounds ? bounds.maxX - bounds.minX : 28;
    const spanZ = bounds ? bounds.maxZ - bounds.minZ : 23;
    const maxSpan = Math.max(spanX, spanZ, 12);
    const scale = ((canvas.width - 34) / maxSpan) * (zoom || 1);
    const offsetX = bounds ? (bounds.minX + bounds.maxX) / 2 : 0;
    const offsetZ = bounds ? (bounds.minZ + bounds.maxZ) / 2 : 0;

    for (const poi of pois) {
      const px = centerX + (poi.position[0] - offsetX) * scale;
      const py = centerY + (poi.position[2] - offsetZ) * scale;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist <= 14) {
        onSelectPoi?.(poi);
        return;
      }
    }
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        borderRadius: '50%',
        padding: 4,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 18px -2px rgba(15, 23, 42, 0.12)',
        border: '2px solid #94a3b8',
        background: '#ffffff',
        cursor: 'crosshair',
      }}
      title="NAVI-3D Spatial Minimap"
    >
      <canvas
        ref={canvasRef}
        width={184}
        height={184}
        onClick={handleCanvasClick}
        style={{
          borderRadius: '50%',
          display: 'block',
          width: 184,
          height: 184,
        }}
      />
    </div>
  );
});

export default Minimap;
