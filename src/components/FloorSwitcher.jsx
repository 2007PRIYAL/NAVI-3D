import React from 'react';
import { Layers, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { FLOOR_LEVELS } from '../data/mockPois.js';

export default function FloorSwitcher({
  floors = FLOOR_LEVELS,
  currentFloorLevel = 0,
  onSelectFloor,
  pois = [],
  interFloorTransition = null,
  style = {},
}) {
  // Elevator panels display top floor on top, ground floor at the bottom
  const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

  return (
    <div
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 60,
        left: 312,
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '8px 8px',
        borderRadius: 12,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        minWidth: 154,
        userSelect: 'none',
        ...style,
      }}
      title="Storey / Level Switcher HUD"
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 6px 6px 6px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Layers size={13} color="#7C3AED" />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Level Switcher
          </span>
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#7C3AED',
            background: '#f5f3ff',
            padding: '1px 5px',
            borderRadius: 4,
          }}
        >
          {floors.length} Floors
        </span>
      </div>

      {/* Vertical Floor Buttons (Top Floor -> Ground) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sortedFloors.map((floor) => {
          const isActive = currentFloorLevel === floor.level;
          const floorPoisCount = pois.filter((p) => (p.floor ?? 0) === floor.level).length;
          const isTransitionTarget =
            interFloorTransition && interFloorTransition.toFloor === floor.level;

          return (
            <button
              key={floor.id}
              onClick={() => onSelectFloor(floor.level)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 8,
                border: isActive
                  ? '2px solid #C026D3'
                  : isTransitionTarget
                  ? '2px dashed #F43F5E'
                  : '1px solid #e2e8f0',
                background: isActive
                  ? '#fdf4ff'
                  : isTransitionTarget
                  ? '#fff1f2'
                  : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              title={`Switch to ${floor.name} (${floor.elevationY}m elevation)`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Level Code Badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 24,
                    borderRadius: 6,
                    background: isActive ? 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {floor.id}
                </span>

                {/* Level Name & Elevation */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#C026D3' : '#0f172a',
                      lineHeight: 1.2,
                    }}
                  >
                    {floor.name.replace(' Level', '').replace(' Floor', '')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: '#64748b',
                      fontWeight: 500,
                    }}
                  >
                    y = +{floor.elevationY.toFixed(1)}m
                  </span>
                </div>
              </div>

              {/* POI Count Badge / Active Dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isActive ? (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#2563eb',
                      boxShadow: '0 0 6px rgba(37, 99, 235, 0.6)',
                    }}
                  />
                ) : floorPoisCount > 0 ? (
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '1px 5px',
                      borderRadius: 9999,
                    }}
                  >
                    {floorPoisCount}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
