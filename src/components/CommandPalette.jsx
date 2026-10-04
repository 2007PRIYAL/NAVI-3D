import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MOCK_POIS, POI_CATEGORIES, FILTER_CATEGORIES } from '../data/mockPois';
import {
  Search,
  X,
  Accessibility,
  Layers,
  Sparkles,
  Compass,
  Ruler,
  Navigation,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  accessible_ramp: Accessibility,
  elevator: Layers,
  restroom: Sparkles,
  emergency_exit: Compass,
  service: Layers,
  amenity: Sparkles,
};

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectPoi,
  playerCoords = { x: 0, z: 5 },
  pois = MOCK_POIS,
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when opened & ensure pointer lock is released
  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut to open/close (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered POIs with fuzzy/tag matching
  const filteredPois = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sourceList = pois && pois.length > 0 ? pois : MOCK_POIS;

    return sourceList.filter((poi) => {
      if (activeCategory !== 'all' && poi.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const matchTitle = poi.title?.toLowerCase().includes(q);
      const matchDesc = poi.description?.toLowerCase().includes(q);
      const matchCat = poi.category?.toLowerCase().includes(q);
      const matchTags = poi.tags?.some((t) => t.toLowerCase().includes(q));
      const matchFeatures = poi.features?.some((f) => f.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCat || matchTags || matchFeatures;
    });
  }, [query, activeCategory, pois]);

  // Keep selectedIndex in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleKeyDown = (e) => {
    if (!filteredPois.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredPois.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPois.length) % filteredPois.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPois[selectedIndex]) {
        onSelectPoi(filteredPois[selectedIndex]);
        onClose();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: 16,
        paddingRight: 16,
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="arch-card-elevated"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid #cbd5e1',
            background: '#ffffff',
          }}
        >
          <Search size={20} color="#7C3AED" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search indoor amenities, safety, or tags (e.g. ramp, exit, elevator)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: '0.96rem',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={13} />
            </button>
          ) : (
            <span className="keycap" style={{ fontSize: '0.68rem', height: 22, minWidth: 32 }}>
              ESC
            </span>
          )}
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderBottom: '1px solid #cbd5e1',
            overflowX: 'auto',
            background: '#f8fafc',
          }}
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)' : '#ffffff',
                  border: `1px solid ${isActive ? 'transparent' : '#cbd5e1'}`,
                  color: isActive ? '#ffffff' : '#334155',
                  padding: '5px 11px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(192, 38, 211, 0.35)' : 'none',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* POI Search Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: 340,
            overflowY: 'auto',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: '#f8fafc',
          }}
        >
          {filteredPois.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              No matching indoor amenities found for "{query}".
            </div>
          ) : (
            filteredPois.map((poi, idx) => {
              const isSelected = idx === selectedIndex;
              const cat = POI_CATEGORIES[poi.category] || POI_CATEGORIES.service;
              const IconComponent = CATEGORY_ICONS[poi.category] || Accessibility;

              const dist = Math.hypot(
                playerCoords.x - poi.position[0],
                playerCoords.z - poi.position[2]
              ).toFixed(1);

              return (
                <div
                  key={poi.id}
                  onClick={() => {
                    onSelectPoi(poi);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: isSelected ? '#ffffff' : '#ffffff',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    boxShadow: isSelected
                      ? '0 6px 16px rgba(37, 99, 235, 0.14)'
                      : '0 1px 3px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {/* Left: Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: cat.badgeBg,
                        border: `1px solid ${cat.borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.textColor || cat.color,
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={18} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: 3,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {poi.title}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '0.72rem',
                          color: '#475569',
                          fontWeight: 500,
                        }}
                      >
                        {poi.floorLabel && (
                          <span
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '1px 5px',
                              borderRadius: 4,
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                            }}
                          >
                            {poi.floorLabel}
                          </span>
                        )}
                        <span style={{ color: cat.textColor || '#0f172a', fontWeight: 600 }}>{cat.label}</span>
                        {poi.wheelchair_accessible !== false && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#0891b2', fontWeight: 700 }}>♿ ADA 1:12</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clearance Badge & Distance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Clearance Width Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      <Ruler size={11} color="#2563eb" />
                      <span>{poi.clearance_cm || poi.clearanceCm || 100}cm</span>
                    </div>

                    {/* Walk Distance */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#2563eb',
                        fontFamily: 'JetBrains Mono, monospace',
                        minWidth: 50,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Navigation size={11} />
                      <span>{dist}m</span>
                    </div>

                    {/* Action Arrow */}
                    <div
                      style={{
                        color: isSelected ? '#2563eb' : '#94a3b8',
                        transform: isSelected ? 'translateX(2px)' : 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #cbd5e1',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#475569',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="keycap" style={{ height: 20, minWidth: 20, fontSize: '0.68rem' }}>
                ↑
              </span>
              <span className="keycap" style={{ height: 20, minWidth: 20, fontSize: '0.68rem' }}>
                ↓
              </span>
              <span>Navigate</span>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="keycap" style={{ height: 20, minWidth: 24, fontSize: '0.68rem' }}>
                ↵
              </span>
              <span>Fly & Inspect</span>
            </span>
          </div>

          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="keycap" style={{ height: 20, minWidth: 28, fontSize: '0.68rem' }}>
              ESC
            </span>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
