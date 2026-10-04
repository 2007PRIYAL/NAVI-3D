import React, { useState } from 'react';
import Minimap from './Minimap';
import {
  Compass,
  Plus,
  Minus,
  Layers,
  ChevronDown,
  Navigation,
  Activity,
  MapPin,
} from 'lucide-react';
import { FLOOR_LEVELS } from '../data/mockPois';

export default function RightMapTelemetryTray({
  minimapRef,
  pois = [],
  bounds = null,
  selectedPoi = null,
  targetPoi = null,
  activeRouteWaypoints = null,
  mode = 'walk',
  onSelectPoi,
  minimapZoom = 1.0,
  setMinimapZoom,
  currentFloorLevel = 0,
  onSelectFloor,
  floors = FLOOR_LEVELS,
  playerCoords,
  navigationTargetPoi = null,
  liveRouteDistance = 0,
}) {
  const [isLayerActive, setIsLayerActive] = useState(false);

  // Calculate heading degrees & cardinal direction from playerCoords.yaw
  const headingDeg = playerCoords
    ? Math.round((((playerCoords.yaw * 180) / Math.PI + 360) % 360))
    : 72;
  const getCardinal = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };
  const cardinal = getCardinal(headingDeg);

  // Altitude in meters
  const altitudeMeters = playerCoords ? (playerCoords.y - 1.6).toFixed(1) : '0.0';

  // Find nearest POI to determine "You are here" label
  let nearestLocation = 'Lobby, Level ' + (currentFloorLevel === 0 ? '1' : currentFloorLevel + 1);
  if (playerCoords && pois.length > 0) {
    let minD = Infinity;
    let closest = null;
    pois.forEach((p) => {
      if ((p.floor ?? 0) === currentFloorLevel) {
        const d = Math.hypot(playerCoords.x - p.position[0], playerCoords.z - p.position[2]);
        if (d < minD) {
          minD = d;
          closest = p;
        }
      }
    });
    if (closest && minD < 6.0) {
      nearestLocation = closest.title;
    }
  }

  // Active destination details
  const destTitle = navigationTargetPoi ? navigationTargetPoi.title : (selectedPoi ? selectedPoi.title : 'Conference Room A');
  const destDistM = liveRouteDistance > 0
    ? Math.round(liveRouteDistance)
    : 42;
  const destETA = liveRouteDistance > 0
    ? `${Math.max(1, Math.ceil(liveRouteDistance / 24))} min (${destDistM} m)`
    : '2 min (42 m)';

  // Floor display name
  const currentFloorObj = floors.find((f) => f.level === currentFloorLevel) || floors[0];
  const floorDisplay = currentFloorLevel === 0 ? 'Level 1 (Ground)' : currentFloorLevel === 1 ? 'Level 2 (Mezzanine)' : 'Level 3 (Terrace)';

  return (
    <div
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="w-72 fixed top-[76px] right-4 space-y-3 z-20"
      style={{
        position: 'absolute',
        top: 76,
        right: 16,
        width: 288, // w-72
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 20,
      }}
    >
      {/* =========================================================================
          CARD A: LIVE MAP (2D) CARD
          ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '14px',
          boxShadow: '0 4px 20px -2px rgba(30, 27, 75, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Header: "Live Map (2D)" & Floor Selector Dropdown */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={16} color="#7C3AED" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.01em' }}>
              Live Map (2D)
            </span>
          </div>

          {/* Floor selector dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={currentFloorLevel}
              onChange={(e) => onSelectFloor?.(parseInt(e.target.value, 10))}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '3px 22px 3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {floors.map((fl) => (
                <option key={fl.level} value={fl.level}>
                  Floor {fl.level + 1}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              color="#64748b"
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Circular Radar Viewport with Map Controls */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <Minimap
            ref={minimapRef}
            pois={pois}
            selectedPoi={selectedPoi}
            targetPoi={targetPoi}
            activeRouteWaypoints={activeRouteWaypoints}
            mode={mode}
            bounds={bounds}
            onSelectPoi={onSelectPoi}
            zoom={minimapZoom}
            currentFloorLevel={currentFloorLevel}
          />

          {/* Floating Zoom Controls: [+] and [-] and Layer Switch Icon */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <button
              onClick={() => setMinimapZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: 0,
              }}
              title="Zoom In"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={() => setMinimapZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: 0,
              }}
              title="Zoom Out"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => setIsLayerActive((prev) => !prev)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: isLayerActive ? '#7C3AED' : 'rgba(255, 255, 255, 0.92)',
                border: '1px solid #cbd5e1',
                color: isLayerActive ? '#ffffff' : '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: 0,
              }}
              title="Toggle Map Layers"
            >
              <Layers size={13} />
            </button>
          </div>

          {/* Interactive Radar Layers Popover */}
          {isLayerActive && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
                padding: '8px 10px',
                zIndex: 25,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                fontSize: '0.68rem',
                color: '#f8fafc',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#93c5fd', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 3 }}>
                Radar Layers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                <span>Floor CAD Outline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                <span>ADA Accessible Nodes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                <span>Vertical Transit</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Mini-Telemetry Row inside Map Card */}
        <div
          style={{
            width: '100%',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            fontSize: '0.7rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0f172a', fontWeight: 600 }}>
            <MapPin size={12} color="#7C3AED" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              You are here: <strong>{nearestLocation}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 500, fontSize: '0.68rem' }}>
            <span>Heading: <strong style={{ color: '#0f172a' }}>{headingDeg}° {cardinal}</strong></span>
            <span>Altitude: <strong style={{ color: '#0f172a' }}>{altitudeMeters} m</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CARD B: LIVE TELEMETRY CARD
          ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '14px',
          boxShadow: '0 4px 20px -2px rgba(30, 27, 75, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Header: "Live Telemetry" with green pulse dot ● Active */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="#10b981" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.01em' }}>
              Live Telemetry
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#047857',
            }}
          >
            <span className="pulse-indicator" style={{ width: 6, height: 6 }} />
            <span>Active</span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px 12px',
            fontSize: '0.72rem',
          }}
        >
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Position
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>
              28.5355° N, 77.3910° E
            </div>
          </div>

          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Floor
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>
              {floorDisplay}
            </div>
          </div>

          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Accuracy
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>
              ± 0.8 m
            </div>
          </div>

          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Velocity
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700 }}>
              1.4 m/s
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', paddingTop: 4, borderTop: '1px dashed #e2e8f0' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Destination
            </div>
            <div style={{ color: '#C026D3', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {destTitle}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              ETA & Distance
            </div>
            <div style={{ color: '#0f172a', fontWeight: 800 }}>
              {destETA}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
