import React, { useState } from 'react';
import {
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Accessibility,
  Eye,
  Activity,
  Cpu,
  Video,
  Navigation,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sliders,
  Check,
  Building,
  Maximize2,
  Footprints,
} from 'lucide-react';
import { REMOTE_DATASETS } from '../data/remoteDatasets.js';
import { playUiClick } from '../utils/audio.js';

export default function LandingPage({
  onLaunchViewer,
  initialDatasetId = 'procedural',
  initialMode = 'walk',
  initialFloor = 0,
}) {
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [selectedFloor, setSelectedFloor] = useState(initialFloor);
  const [activeDatasetId, setActiveDatasetId] = useState(initialDatasetId);

  const handleLaunch = (datasetId = activeDatasetId, floor = selectedFloor, mode = selectedMode) => {
    playUiClick();
    onLaunchViewer?.({
      datasetId,
      floor,
      mode,
    });
  };

  return (
    <div
      className="landing-scroll-container"
      style={{
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#07090e',
        color: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '600px',
          background: 'radial-gradient(circle at 50% 0%, rgba(192, 38, 211, 0.18) 0%, rgba(124, 58, 237, 0.12) 35%, rgba(244, 63, 94, 0.05) 65%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* =========================================================================
          GLOBAL NAVIGATION BAR
          ========================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: 64,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="NAVI-3D Logo"
            style={{ height: 36, width: 36, objectFit: 'contain' }}
            className="drop-shadow-sm"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.02rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
              NAVI-<span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3D</span>
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Neural Accessibility & Vision-guided 3D Navigator
            </span>
          </div>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a
            href="#architecture"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            Architecture
          </a>
          <a
            href="#technology"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            Technology
          </a>
          <a
            href="#accessibility"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            Accessibility
          </a>
          <a
            href="#environments"
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
          >
            Environments
          </a>
        </nav>

        {/* Action Button */}
        <button
          onClick={() => handleLaunch()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(192, 38, 211, 0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>Launch 3D Twin</span>
          <ArrowRight size={15} />
        </button>
      </header>

      {/* =========================================================================
          SECTION 1: HERO (ScamShield Dark Tech Architectural Layout)
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 32px 100px 32px',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '56px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Headlines & Value Proposition */}
        <div>
          {/* Micro Tag Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'rgba(192, 38, 211, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#f472b6',
              letterSpacing: '0.04em',
              marginBottom: 24,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F43F5E', boxShadow: '0 0 8px #F43F5E' }} />
            <span>NEURAL ACCESSIBILITY & VISION-GUIDED INDOOR 3D NAVIGATOR</span>
          </div>

          <h1
            style={{
              fontSize: '3.4rem',
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: '-0.035em',
              color: '#ffffff',
              marginBottom: 24,
            }}
          >
            Navigate indoor spaces <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #C026D3 0%, #F43F5E 50%, #FB923C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              before satellites fail.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              marginBottom: 36,
              maxWidth: 580,
            }}
          >
            Indoor spatial intelligence powered by neural radiance fields and dynamic ADA accessibility heuristics.
            Commodity smartphone walkthrough videos transformed into photorealistic <strong style={{ color: '#f1f5f9' }}>3D Gaussian Splats</strong> with real-time autonomous pathfinding.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => handleLaunch()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.94rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px -4px rgba(192, 38, 211, 0.45)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Explore Live 3D Twin</span>
              <ArrowRight size={17} />
            </button>

            <a
              href="#architecture"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <span>Read Architecture</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              marginTop: 48,
              paddingTop: 32,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>60 FPS</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Realtime WebGL2 Splats</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255, 255, 255, 0.08)' }} />
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981' }}>±0.4m</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Grid Precision</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'rgba(255, 255, 255, 0.08)' }} />
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8' }}>1:12 ADA</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Incline Verified</div>
            </div>
          </div>
        </div>

        {/* Right Column: ScamShield-Style Interactive Live Telemetry Card */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: 18,
              background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.85) 0%, rgba(10, 15, 26, 0.95) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.15)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              overflow: 'hidden',
            }}
          >
            {/* Top Bar of Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  TELEMETRY ENGINE: LIVE
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.68rem',
                  color: '#60a5fa',
                  background: 'rgba(37, 99, 235, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                v1.2.0 • PROD
              </span>
            </div>

            {/* Viewport Preview Graphic */}
            <div
              style={{
                position: 'relative',
                height: 180,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#030712',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/assets/future_spatial_twin.jpg"
                alt="NAVI-3D Spatial Twin"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.85,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Floor Plan Overlay Schematic */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(3, 7, 18, 0.95) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Active Spatial Zone</div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                      {selectedFloor === 2 ? 'Terrace & Rooftop' : selectedFloor === 1 ? 'Mezzanine Atrium' : 'Ground Concourse'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLaunch()}
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: 6,
                      padding: '5px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(192, 38, 211, 0.35)',
                    }}
                  >
                    View in 3D ↗
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Control 1: Mobility Mode Switcher */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Mobility Profile
                </span>
                <span style={{ fontSize: '0.72rem', color: selectedMode === 'wheelchair' ? '#22d3ee' : '#60a5fa', fontWeight: 700 }}>
                  {selectedMode === 'wheelchair' ? 'ADA Compliant Route' : 'Direct Footpath'}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: 4,
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <button
                  onClick={() => {
                    setSelectedMode('walk');
                    playUiClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: selectedMode === 'walk' ? '1px solid #3b82f6' : '1px solid transparent',
                    background: selectedMode === 'walk' ? '#1e293b' : 'transparent',
                    color: selectedMode === 'walk' ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  <Footprints size={14} color={selectedMode === 'walk' ? '#38bdf8' : '#64748b'} />
                  <span>🚶 Standard Walk</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMode('wheelchair');
                    playUiClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: selectedMode === 'wheelchair' ? '1px solid #06b6d4' : '1px solid transparent',
                    background: selectedMode === 'wheelchair' ? '#1e293b' : 'transparent',
                    color: selectedMode === 'wheelchair' ? '#22d3ee' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  <Accessibility size={14} color={selectedMode === 'wheelchair' ? '#22d3ee' : '#64748b'} />
                  <span>♿ Wheelchair ADA</span>
                </button>
              </div>
            </div>

            {/* Interactive Control 2: Storey Switcher */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Floor Level
                </span>
                <span style={{ fontSize: '0.72rem', color: '#f8fafc', fontWeight: 700 }}>
                  Elev. +{selectedFloor * 4.0}m
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { level: 0, label: 'L0 | Ground' },
                  { level: 1, label: 'L1 | Mezzanine' },
                  { level: 2, label: 'L2 | Terrace' },
                ].map((fl) => (
                  <button
                    key={fl.level}
                    onClick={() => {
                      setSelectedFloor(fl.level);
                      playUiClick();
                    }}
                    style={{
                      padding: '7px 8px',
                      borderRadius: 6,
                      border: selectedFloor === fl.level ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: selectedFloor === fl.level ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                      color: selectedFloor === fl.level ? '#ffffff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Telemetry Pills Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Door Clearance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#10b981' }}>110 cm</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '2px 5px',
                      borderRadius: 4,
                      fontWeight: 800,
                    }}
                  >
                    PASS
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Live Egress Index
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#38bdf8' }}>100%</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Unblocked</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Launch Action */}
            <button
              onClick={() => handleLaunch()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(192, 38, 211, 0.4)',
              }}
            >
              <span>Initialize Engine at L{selectedFloor} ({selectedMode === 'wheelchair' ? 'Accessible' : 'Standard'})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 3 ARCHITECTURE PILLARS (Numbered 01, 02, 03)
          ========================================================================= */}
      <section
        id="architecture"
        style={{
          position: 'relative',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 32px 100px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            System Architecture
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
            Built for GPS-Denied Autonomous Intelligence
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: 640, margin: '14px auto 0 auto' }}>
            A three-tier spatial pipeline designed to convert commodity optical video into deterministic
            navigation geometry without external infrastructure.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {/* Pillar 01 */}
          <div
            style={{
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6' }}>01</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                INGESTION
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              Zero-Hardware Capture Ingestion
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
              Extracts 4K smartphone video frames, performs Laplacian blur filtering, and computes sparse
              Structure-from-Motion without requiring LiDAR scanners or expensive Bluetooth beacon grids.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Commodity 4K 60FPS Video Input</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Laplacian Sharpness Quality Filter</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Zero Infrastructure / Zero Beacons</span>
              </li>
            </ul>
          </div>

          {/* Pillar 02 */}
          <div
            style={{
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.2)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 900, color: '#06b6d4' }}>02</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#22d3ee',
                  background: 'rgba(6, 182, 212, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                DUAL RUNTIME
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              Decoupled Radiance & Collision Engine
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
              Visual layer rendered via 60 FPS 3D Gaussian Splatting; navigation layer locked to an invisible
              2.5D floor occupancy grid with centimeter-scale A* pathing.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>60 FPS WebGL2 Hardware Rasterizer</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Invisible 40cm Spatial Occupancy Grid</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Dynamic Live Catmull-Rom Ribbon Slicing</span>
              </li>
            </ul>
          </div>

          {/* Pillar 03 */}
          <div
            style={{
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>03</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                ACCESSIBILITY
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              Universal Accessibility & ADA Profiling
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
              Mathematical path heuristics that actively block stairs and re-route through certified 1:12 slope
              ramps and express elevators for mobility-impaired visitors.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Strict ADA 1:12 Slope Compliance</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Multi-Storey Elevator Path Stitching</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                <Check size={14} color="#10b981" />
                <span>Physical Stairs Climb Simulation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SELECTABLE 3D SPATIAL ENVIRONMENTS
          ========================================================================= */}
      <section
        id="environments"
        style={{
          position: 'relative',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 32px 100px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Curated Environments
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
              Select a Spatial Twin
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem', maxWidth: 420 }}>
            Choose an environment to launch directly into first-person roaming and live ADA navigation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {REMOTE_DATASETS.map((ds) => {
            const isSelected = activeDatasetId === ds.id;
            return (
              <div
                key={ds.id}
                onClick={() => {
                  setActiveDatasetId(ds.id);
                  playUiClick();
                }}
                style={{
                  borderRadius: 14,
                  background: isSelected ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.45)',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 10px 25px -5px rgba(37, 99, 235, 0.3)' : 'none',
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '1.8rem' }}>{ds.icon}</span>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontFamily: 'monospace',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#94a3b8',
                    }}
                  >
                    {ds.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                  {ds.name}
                </h4>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 20, flex: 1 }}>
                  {ds.description.slice(0, 95)}...
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch(ds.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: isSelected ? 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)' : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>Launch Scene</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TECHNICAL COMPARISON TABLE
          ========================================================================= */}
      <section
        id="technology"
        style={{
          position: 'relative',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 32px 100px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
            Infrastructure Comparison
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.96rem', marginTop: 8 }}>
            Why commodity 3D Gaussian Splats outperform legacy hardware sensor beacons.
          </p>
        </div>

        <div
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 700 }}>SPECIFICATION</th>
                <th style={{ padding: '16px 20px', color: '#38bdf8', fontWeight: 800 }}>NAVI-3D</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>WIFI FINGERPRINTING</th>
                <th style={{ padding: '16px 20px', color: '#94a3b8', fontWeight: 600 }}>TERRESTRIAL LIDAR</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 600 }}>Hardware Ingestion Cost</td>
                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 800 }}>$0 (Commodity Phone)</td>
                <td style={{ padding: '16px 20px', color: '#f87171' }}>$5,000+ (AP Network)</td>
                <td style={{ padding: '16px 20px', color: '#f87171' }}>$25,000+ (Scanner)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 600 }}>Rendering Layer</td>
                <td style={{ padding: '16px 20px', color: '#38bdf8', fontWeight: 800 }}>3D Gaussian Splatting (60 FPS)</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>2D Raster Floorplans</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>Raw Point Clouds</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 600 }}>Multi-Storey Elevator Routing</td>
                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 800 }}>Dynamic Vertical A* Stitching</td>
                <td style={{ padding: '16px 20px', color: '#f87171' }}>Manual Level Toggles</td>
                <td style={{ padding: '16px 20px', color: '#f87171' }}>Offline Mesh Stitching</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 20px', color: '#f8fafc', fontWeight: 600 }}>ADA Accessibility Verification</td>
                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 800 }}>Title III 1:12 Slope & Clearance</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>None</td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>Manual CAD Inspection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          GLOBAL FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#04060a',
          padding: '48px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="NAVI-3D" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
              © 2026 NAVI-3D (Neural Accessibility & Vision-guided Indoor 3D Navigator). All rights reserved.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => handleLaunch()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(192, 38, 211, 0.3)',
              }}
            >
              <span>Launch Engine</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
