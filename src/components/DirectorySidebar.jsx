import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  Search,
  ChevronRight,
  User,
  Layers,
  Footprints,
  Briefcase,
  Coffee,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { FILTER_CATEGORIES } from '../data/mockPois';
import { playUiClick, playNavigationStart } from '../utils/audio';

function getPoiIconBadge(poi) {
  const pType = poi.poiType || '';
  const title = (poi.title || '').toLowerCase();
  const cat = (poi.category || '').toLowerCase();

  if (pType === 'reception' || title.includes('reception') || title.includes('lobby')) {
    return {
      icon: <User size={15} color="#4f46e5" />,
      bg: '#eef2ff',
      border: '#c7d2fe',
    };
  }
  if (pType === 'elevator' || title.includes('elevator') || title.includes('lift')) {
    return {
      icon: <Layers size={15} color="#10b981" />,
      bg: '#ecfdf5',
      border: '#a7f3d0',
    };
  }
  if (pType === 'stairs' || title.includes('stair') || title.includes('steps')) {
    return {
      icon: <Footprints size={15} color="#f59e0b" />,
      bg: '#fffbeb',
      border: '#fde68a',
    };
  }
  if (pType === 'conference' || cat === 'rooms' || title.includes('conference') || title.includes('room')) {
    return {
      icon: <Briefcase size={15} color="#2563eb" />,
      bg: '#eff6ff',
      border: '#bfdbfe',
    };
  }
  if (pType === 'cafeteria' || title.includes('cafe') || title.includes('coffee') || title.includes('lounge')) {
    return {
      icon: <Coffee size={15} color="#ea580c" />,
      bg: '#fff7ed',
      border: '#fed7aa',
    };
  }
  if (pType === 'restroom' || title.includes('restroom') || title.includes('toilet') || title.includes('washroom')) {
    return {
      icon: <Sparkles size={15} color="#0891b2" />,
      bg: '#ecfeff',
      border: '#a5f3fc',
    };
  }
  if (pType === 'exit' || cat === 'emergency' || title.includes('exit') || title.includes('emergency')) {
    return {
      icon: <ShieldAlert size={15} color="#ef4444" />,
      bg: '#fef2f2',
      border: '#fecaca',
    };
  }

  return {
    icon: <Compass size={15} color="#2563eb" />,
    bg: '#eff6ff',
    border: '#bfdbfe',
  };
}

export default function DirectorySidebar({
  pois = [],
  selectedPoi = null,
  onSelectPoi,
  onStartNavigation,
  playerCoords,
  currentFloorLevel = 0,
  onSelectFloor,
}) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' (Places) | 'routes' (Quick Routes)
  const [activeFilterPill, setActiveFilterPill] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // 4 Simple Curated Routes
  const presetRoutes = [
    {
      id: 'route_conf_a',
      title: 'Main Lobby → Conf Room A',
      desc: 'Direct level walking corridor',
      distance: '24 m',
      eta: '1 min',
      targetTitle: 'Conference Room A',
      floor: 0,
    },
    {
      id: 'route_elevator',
      title: 'Lobby → Braille Elevator',
      desc: '100% ADA step-free wheelchair route',
      distance: '18 m',
      eta: '1 min',
      targetTitle: 'Priority Braille Elevator',
      floor: 0,
    },
    {
      id: 'route_cafe',
      title: 'Entrance → Central Cafeteria',
      desc: 'Dining & relaxation lounge area',
      distance: '32 m',
      eta: '2 min',
      targetTitle: 'Central Cafeteria & Lounge',
      floor: 0,
    },
    {
      id: 'route_egress',
      title: '🚨 Emergency Evacuation Exit',
      desc: 'Fastest egress path to North Exit',
      distance: '38 m',
      eta: '1 min',
      targetTitle: 'North Emergency Exit',
      floor: 0,
    },
  ];

  const handleStartPresetRoute = (route) => {
    playNavigationStart();
    const poi = pois.find((p) => p.title.toLowerCase().includes(route.targetTitle.toLowerCase())) || pois[0];
    if (poi) {
      if (poi.floor !== undefined && onSelectFloor) {
        onSelectFloor(poi.floor);
      }
      onSelectPoi?.(poi);
      onStartNavigation?.(poi);
    }
  };

  // Filtered POIs for Places Directory
  const filteredPois = pois.filter((poi) => {
    if (activeFilterPill !== 'all') {
      const poiCat = (poi.category || '').toLowerCase();
      if (activeFilterPill === 'rooms' && poiCat !== 'rooms') return false;
      if (activeFilterPill === 'amenities' && poiCat !== 'amenities') return false;
      if (activeFilterPill === 'services' && poiCat !== 'services') return false;
      if (activeFilterPill === 'emergency' && poiCat !== 'emergency') return false;
    }
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const title = (poi.title || '').toLowerCase();
      const loc = (poi.location || '').toLowerCase();
      const desc = (poi.description || '').toLowerCase();
      const tags = (poi.tags || []).join(' ').toLowerCase();
      if (!title.includes(q) && !loc.includes(q) && !desc.includes(q) && !tags.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <aside
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 64, // below h-16 header
        bottom: 0,
        left: 0,
        width: 336, // w-84
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* =========================================================================
          SIMPLE 2-SEGMENT SWITCHER: [📍 Places] vs [🧭 Quick Routes]
          (Removed cluttered Home, Analytics, Settings tabs)
          ========================================================================= */}
      <div style={{ padding: '12px 16px 8px 16px' }}>
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: 3,
            borderRadius: 10,
            gap: 4,
          }}
        >
          <button
            onClick={() => {
              playUiClick();
              setActiveTab('directory');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '7px 0',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'directory' ? '#ffffff' : 'transparent',
              color: activeTab === 'directory' ? '#1E1B4B' : '#64748b',
              fontWeight: activeTab === 'directory' ? 700 : 600,
              fontSize: '0.76rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'directory' ? '0 1px 3px rgba(30, 27, 75, 0.08)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <MapPin size={14} color={activeTab === 'directory' ? '#7C3AED' : '#64748b'} />
            <span>Places ({pois.length})</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setActiveTab('routes');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '7px 0',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'routes' ? '#ffffff' : 'transparent',
              color: activeTab === 'routes' ? '#1E1B4B' : '#64748b',
              fontWeight: activeTab === 'routes' ? 700 : 600,
              fontSize: '0.76rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'routes' ? '0 1px 3px rgba(30, 27, 75, 0.08)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <Navigation size={14} color={activeTab === 'routes' ? '#7C3AED' : '#64748b'} />
            <span>Quick Routes</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PLACES DIRECTORY (Default & Simple)
          ========================================================================= */}
      {activeTab === 'directory' && (
        <>
          {/* Quick Filter Search Input */}
          <div style={{ padding: '4px 16px 8px 16px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '7px 10px',
              }}
            >
              <Search size={14} color="#94a3b8" style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search rooms, elevators, exits..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.76rem',
                  color: '#0f172a',
                  fontFamily: 'inherit',
                }}
              />
              {filterSearch && (
                <button
                  onClick={() => setFilterSearch('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0 2px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Simple Filter Category Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 16px 10px 16px',
              overflowX: 'auto',
            }}
          >
            {FILTER_CATEGORIES.map((pill) => {
              const isActive = activeFilterPill === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    playUiClick();
                    setActiveFilterPill(pill.id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : 500,
                    border: isActive ? 'none' : '1px solid #e2e8f0',
                    background: isActive ? 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(192, 38, 211, 0.35)' : 'none',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Clean POI Cards List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 16px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {filteredPois.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                }}
              >
                No locations match your search.
              </div>
            ) : (
              filteredPois.map((poi) => {
                const isSelected = selectedPoi?.id === poi.id;
                const badge = getPoiIconBadge(poi);
                let distMeters = null;
                if (playerCoords && poi.position) {
                  const dx = playerCoords.x - poi.position[0];
                  const dz = playerCoords.z - poi.position[2];
                  distMeters = Math.max(1, Math.round(Math.hypot(dx, dz)));
                }

                return (
                  <div
                    key={poi.id}
                    onClick={() => {
                      onSelectPoi?.(poi);
                      onStartNavigation?.(poi);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: isSelected ? '#fdf4ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #C026D3' : '1px solid #e2e8f0',
                      boxShadow: isSelected
                        ? '0 2px 10px rgba(192, 38, 211, 0.16)'
                        : '0 1px 2px rgba(15, 23, 42, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    {/* Icon Badge */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9999,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {badge.icon}
                    </div>

                    {/* Title & Floor */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {poi.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: '#64748b',
                          fontWeight: 500,
                          marginTop: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {poi.location || `Floor ${poi.floor ?? 0}`}
                      </div>
                    </div>

                    {/* Distance & Navigate Chevron */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {distMeters !== null && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {distMeters} m
                        </span>
                      )}
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: QUICK ROUTES (Simple One-Click Navigation)
          ========================================================================= */}
      {activeTab === 'routes' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
            Direct Campus Routes
          </div>

          {presetRoutes.map((route) => (
            <div
              key={route.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                  {route.title}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C026D3', background: '#fdf4ff', padding: '2px 6px', borderRadius: 6 }}>
                  {route.distance}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{route.desc}</p>
              <button
                onClick={() => handleStartPresetRoute(route)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(192, 38, 211, 0.3)',
                  transition: 'opacity 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <span>Navigate Here</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
