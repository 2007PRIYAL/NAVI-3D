import React from 'react';
import Minimap from './Minimap';
import { Compass, Plus, Minus } from 'lucide-react';

export default function MinimapCard({
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
  floors = [],
}) {
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
        right: 16,
        width: 206,
        zIndex: 20,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 14,
        padding: '10px 10px',
        boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Header: Title & +/- Zoom Controls */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 6,
          borderBottom: '1px solid #cbd5e1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Compass size={15} color="#2563eb" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Radar
          </span>
          <span
            style={{
              fontSize: '0.64rem',
              fontWeight: 800,
              color: '#1d4ed8',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '1px 5px',
              borderRadius: 4,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            L{currentFloorLevel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button
            onClick={() => setMinimapZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontWeight: 700,
              transition: 'all 0.12s ease',
            }}
            title="Zoom Out Radar"
          >
            <Minus size={12} />
          </button>

          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#0f172a',
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {minimapZoom.toFixed(1)}x
          </span>

          <button
            onClick={() => setMinimapZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontWeight: 700,
              transition: 'all 0.12s ease',
            }}
            title="Zoom In Radar"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Circular Radar Canvas */}
      <Minimap
        ref={minimapRef}
        pois={pois}
        bounds={bounds}
        selectedPoi={selectedPoi}
        targetPoi={targetPoi}
        activeRouteWaypoints={activeRouteWaypoints}
        mode={mode}
        onSelectPoi={onSelectPoi}
        zoom={minimapZoom}
        currentFloorLevel={currentFloorLevel}
      />
    </div>
  );
}
