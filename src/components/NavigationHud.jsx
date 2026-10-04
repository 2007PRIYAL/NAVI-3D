import React from 'react';
import {
  Navigation,
  ArrowUp,
  CornerUpRight,
  Footprints,
  Accessibility,
  X,
  MapPin,
} from 'lucide-react';

export default function NavigationHud({
  navigationTargetPoi,
  activeRouteWaypoints,
  liveRouteDistance = 0,
  mode = 'walk',
  onToggleMode,
  onClearNavigation,
  currentFloorLevel = 0,
}) {
  if (!navigationTargetPoi) return null;

  const targetFloor = navigationTargetPoi.floor ?? currentFloorLevel;
  const distMeters = Math.max(1, Math.round(liveRouteDistance || 42));
  const etaMinutes = Math.max(1, Math.ceil(distMeters / 24));

  // Determine current turn distance
  const straightMeters = Math.min(distMeters, 18);
  const nextTargetName = navigationTargetPoi.title.includes('Stair')
    ? 'staircase'
    : navigationTargetPoi.title.includes('Elevator')
    ? 'elevator shaft'
    : navigationTargetPoi.title;

  return (
    <div
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 18px',
        borderRadius: 20, // rounded-2xl
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -4px rgba(30, 27, 75, 0.12), 0 4px 8px -2px rgba(30, 27, 75, 0.05)',
        maxWidth: '94%',
        overflow: 'hidden',
      }}
    >
      {/* 0. Top Brand Gradient Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
        }}
      />

      {/* 1. Destination Pin Block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #fdf4ff 0%, #fff1f2 100%)',
            border: '1px solid #f5d0fe',
            color: '#C026D3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Navigation size={18} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1E1B4B', whiteSpace: 'nowrap' }}>
            Go to <span style={{ color: '#C026D3' }}>{navigationTargetPoi.title}</span>
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
            {etaMinutes} min • {distMeters} m • Level {targetFloor + 1}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />

      {/* 2. Turn Instruction Card: Upward directional arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '6px 12px',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowUp size={14} />
        </div>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1E1B4B', whiteSpace: 'nowrap' }}>
          Continue straight for {straightMeters} meters
        </span>
      </div>

      {/* 3. Sub-Turn Card: Right curve arrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '6px 12px',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#F43F5E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CornerUpRight size={14} />
        </div>
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
          Then turn right towards the {nextTargetName}
        </span>
      </div>

      <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />

      {/* 4. Mobility Switcher: [🚶 Walk (Coral/Amber)] vs [♿ Wheelchair (Violet/Pink)] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f1f5f9',
          padding: 3,
          borderRadius: 10,
          gap: 3,
        }}
      >
        <button
          onClick={() => {
            if (mode !== 'walk') onToggleMode?.();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 8,
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mode === 'walk' ? 'linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)' : 'transparent',
            color: mode === 'walk' ? '#ffffff' : '#334155',
            boxShadow: mode === 'walk' ? '0 2px 8px rgba(244, 63, 94, 0.35)' : 'none',
          }}
        >
          <Footprints size={13} />
          <span>Walk</span>
        </button>

        <button
          onClick={() => {
            if (mode !== 'wheelchair') onToggleMode?.();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 8,
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mode === 'wheelchair' ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' : 'transparent',
            color: mode === 'wheelchair' ? '#ffffff' : '#334155',
            boxShadow: mode === 'wheelchair' ? '0 2px 8px rgba(139, 92, 246, 0.35)' : 'none',
          }}
        >
          <Accessibility size={13} />
          <span>Wheelchair</span>
        </button>
      </div>

      {/* 5. Route cancel cross ✕ */}
      <button
        onClick={onClearNavigation}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          color: '#64748b',
          cursor: 'pointer',
          transition: 'all 0.12s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#fef2f2';
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.borderColor = '#fecaca';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
        title="Cancel Navigation"
      >
        <X size={15} />
      </button>
    </div>
  );
}
