import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Accessibility,
  ArrowRight,
  Eye,
  Activity,
  ShieldCheck,
  Zap,
  Radio,
  Cpu,
  Thermometer,
  Volume2,
  Wind,
  CheckCircle2,
  Navigation,
  Box,
  MapPin,
  ChevronRight,
  Sparkle,
  Sliders,
  UploadCloud,
  FileSpreadsheet,
  Code,
  Globe,
  Database,
  Play,
} from 'lucide-react';
import { POI_CATEGORIES } from '../data/mockPois';
import { REMOTE_DATASETS } from '../data/remoteDatasets';

// PlayStation signature geometry motifs
const PS5_SYMBOLS = ['△', '◯', '✕', '▢'];

export default function Dashboard({
  pois = [],
  onLaunch3D,
  onSelectPoi,
  playerCoords,
  mode = 'walk',
  datasetType = 'splat',
  currentDataset,
  selectedDatasetId,
  onSelectDataset,
  onOpenAnalysisModal,
  onOpenRemoteUrlModal,
}) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#05070c',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(0, 112, 209, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 90% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, rgba(0, 67, 156, 0.2) 0%, transparent 60%)
        `,
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        padding: '84px 24px 60px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Floating PlayStation Symbols */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            fontSize: '4.5rem',
            color: 'rgba(56, 189, 248, 0.05)',
            fontFamily: 'sans-serif',
            animation: 'symbolDrift 8s ease-in-out infinite',
          }}
        >
          △
        </span>
        <span
          style={{
            position: 'absolute',
            top: '40%',
            right: '6%',
            fontSize: '5.5rem',
            color: 'rgba(0, 112, 209, 0.05)',
            fontFamily: 'sans-serif',
            animation: 'symbolDrift 10s ease-in-out infinite 2s',
          }}
        >
          ◯
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '12%',
            fontSize: '5rem',
            color: 'rgba(6, 182, 212, 0.05)',
            fontFamily: 'sans-serif',
            animation: 'symbolDrift 9s ease-in-out infinite 1s',
          }}
        >
          ✕
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '18%',
            fontSize: '4.8rem',
            color: 'rgba(56, 189, 248, 0.04)',
            fontFamily: 'sans-serif',
            animation: 'symbolDrift 11s ease-in-out infinite 3s',
          }}
        >
          ▢
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* ================================================================ */}
        {/* 1. PLAYSTATION-INSPIRED HERO BANNER */}
        {/* ================================================================ */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 28,
            border: '1px solid rgba(255, 255, 255, 0.14)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 29, 0.95) 100%)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 112, 209, 0.18)',
            padding: '36px 40px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: 36,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Decorative PS5 Brand Bar on top edge */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #00439c 0%, #0070d1 30%, #06b6d4 70%, #38bdf8 100%)',
            }}
          />

          {/* Left Column: Typography & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Tag Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(0, 112, 209, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                }}
              >
                <Zap size={13} />
                <span>Next-Gen Spatial Twin</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                }}
              >
                <ShieldCheck size={13} color="#10b981" />
                <span>Intelligent Spatial Engine</span>
              </div>

              {/* PlayStation Symbol Row */}
              <div style={{ display: 'flex', gap: 6, opacity: 0.6, fontSize: '0.75rem', color: '#94a3b8' }}>
                {PS5_SYMBOLS.map((s, idx) => (
                  <span key={idx}>{s}</span>
                ))}
              </div>
            </div>

            {/* Bold PlayStation-Style Headline */}
            <div>
              <h1
                className="ps5-glow-text"
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                ACCESSIBILITY <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #38bdf8 0%, #0070d1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  HAS NO LIMITS.
                </span>
              </h1>
              <p
                style={{
                  marginTop: 14,
                  fontSize: '0.96rem',
                  lineHeight: 1.55,
                  color: '#94a3b8',
                  maxWidth: 540,
                }}
              >
                Welcome to <strong>AegisIndoor 3D</strong>—the intelligent indoor spatial computing platform.
                Combining 3D Gaussian Splatting, obstacle-aware dual-mode pathfinding, real-time spatial
                minimap telemetry, and synthesized haptic web audio for universal accessibility.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                onClick={() => onLaunch3D?.('first_person')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 14,
                  padding: '13px 26px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  border: '1px solid rgba(56, 189, 248, 0.8)',
                  background: 'linear-gradient(135deg, #0070d1 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 28px rgba(0, 112, 209, 0.55), 0 4px 16px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 38px rgba(6, 182, 212, 0.75), 0 8px 24px rgba(0, 0, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 28px rgba(0, 112, 209, 0.55), 0 4px 16px rgba(0, 0, 0, 0.4)';
                }}
              >
                <span>Launch 3D Twin Experience</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => onLaunch3D?.('dollhouse')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 14,
                  padding: '13px 22px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  color: '#e2e8f0',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                }}
              >
                <Layers size={16} color="#38bdf8" />
                <span>3D Dollhouse View</span>
              </button>

              <button
                onClick={() => onOpenAnalysisModal?.()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 14,
                  padding: '13px 22px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(6, 182, 212, 0.6)',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: '#38bdf8',
                  boxShadow: '0 0 18px rgba(6, 182, 212, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.3)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Sliders size={16} />
                <span>Upload & Analyze File</span>
              </button>
            </div>
          </div>

          {/* Right Column: High-Tech Floating 3D Artwork */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Pulsing Backlight Halo */}
            <div
              style={{
                position: 'absolute',
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 112, 209, 0.35) 0%, rgba(6, 182, 212, 0.1) 70%, transparent 100%)',
                filter: 'blur(45px)',
                zIndex: 0,
              }}
            />

            {/* Floating Hero Image */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: 440,
                borderRadius: 20,
                overflow: 'hidden',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 112, 209, 0.3)',
                animation: 'floatHero 6s ease-in-out infinite',
              }}
            >
              <img
                src="/assets/ps5_twin_hero.jpg"
                alt="AegisIndoor Spatial Hardware Console"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />

              {/* Floating Holographic Telemetry Badge Over Image */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: 'rgba(10, 15, 29, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="pulse-indicator" style={{ width: 7, height: 7 }} />
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>TWINCORE L2 ACTIVE</span>
                </div>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                  9,822 SPLATS • 60 FPS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. CORE TELEMETRY & ADA KPI CARDS (4-METRICS ROW) */}
        {/* ================================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {/* KPI 1: ADA Accessibility Index */}
          <div
            className="glass-panel ps5-card"
            style={{
              borderRadius: 20,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ADA Accessibility Rating
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Accessibility size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                98.4<span style={{ fontSize: '1.4rem', color: '#06b6d4' }}>%</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <CheckCircle2 size={13} />
                <span>Fully Certified</span>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
              1:12 ADA slope ramp • Step-free transit corridors • 240cm minimum clearance
            </div>
          </div>

          {/* KPI 2: Gaussian Splats 3D Engine */}
          <div
            className="glass-panel ps5-card"
            style={{
              borderRadius: 20,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gaussian Splats Stream
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0, 112, 209, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                9,822
              </div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600, marginBottom: 4, fontFamily: 'monospace' }}>
                60.0 FPS WebGL
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
              Real-time radiance field • 306.9 KB payload • Zero network latency
            </div>
          </div>

          {/* KPI 3: Dual-Mode A* Navigation */}
          <div
            className="glass-panel ps5-card"
            style={{
              borderRadius: 20,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dual-Mode Pathfinding
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Navigation size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                ≥90<span style={{ fontSize: '1.4rem', color: '#f59e0b' }}>cm</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>
                Buffer Inflation
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
              Automatic stairs exclusion for wheelchair • Ramp slope routing • 40cm grid
            </div>
          </div>

          {/* KPI 4: Synthesized Spatial Audio */}
          <div
            className="glass-panel ps5-card"
            style={{
              borderRadius: 20,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spatial Audio Synthesis
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Volume2 size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                0<span style={{ fontSize: '1.4rem', color: '#a855f7' }}>kb</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a855f7', fontWeight: 600, marginBottom: 4 }}>
                Zero External Files
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
              DualSense-grade synthesized chime synthesis • Arrival fanfare • Hazard buzzers
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2b. UNIVERSAL FILE INGESTION & ACCESSIBILITY ANALYSIS BANNER */}
        {/* ================================================================ */}
        <div
          className="glass-panel ps5-card"
          style={{
            borderRadius: 22,
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(8, 14, 28, 0.95) 0%, rgba(0, 67, 156, 0.22) 100%)',
            border: '1px solid rgba(0, 112, 209, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 112, 209, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #0070d1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
                }}
              >
                <Sliders size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Universal File Ingestion & Spatial Analysis Studio
                </div>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600 }}>
                  Automated ADA Compliance • Bottleneck Detection • 3D Twin Projection
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Add <strong>any common file</strong> (CSV/TSV tables, GeoJSON coordinates, architectural blueprint images, 3D point clouds, or safety audit logs) to perform instant accessibility grading, corridor clearance evaluation, and live 3D twin rendering.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {[
                { label: '.CSV / .TSV', color: '#06b6d4' },
                { label: '.GEOJSON / .JSON', color: '#38bdf8' },
                { label: '.PNG / .JPG / .SVG', color: '#10b981' },
                { label: '.TXT / .LOG', color: '#f59e0b' },
                { label: '.SPLAT / .PLY', color: '#a855f7' },
              ].map((fmt, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 8,
                    background: `${fmt.color}15`,
                    border: `1px solid ${fmt.color}40`,
                    color: fmt.color,
                  }}
                >
                  {fmt.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
            <button
              onClick={() => onOpenAnalysisModal?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: 'linear-gradient(135deg, #00439c 0%, #0070d1 100%)',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(0, 112, 209, 0.6)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 112, 209, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 112, 209, 0.6)';
              }}
            >
              <UploadCloud size={18} />
              <span>Open Analysis Studio</span>
              <ArrowRight size={16} />
            </button>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Includes 1-click Hospital, Airport, and Blueprint sample presets
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2c. REAL-LIFE 3D SCENE & POI DATABASE (HUGGING FACE / CDN) */}
        {/* ================================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                REAL-LIFE 3D SCENE & POI DATABASE
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#38bdf8',
                  }}
                >
                  CDN STREAMING
                </span>
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                Stream real-life indoor captures from Hugging Face datasets or switch to high-contrast CAD twins with 1 click.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => onOpenRemoteUrlModal?.()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#c084fc',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.25)';
                  e.currentTarget.style.borderColor = '#c084fc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                }}
              >
                <Globe size={15} />
                <span>Stream Custom Remote URL</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {REMOTE_DATASETS.map((ds) => {
              const isActive = selectedDatasetId === ds.id;
              return (
                <div
                  key={ds.id}
                  className="glass-panel ps5-card"
                  style={{
                    borderRadius: 18,
                    padding: 20,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 15, 29, 0.9) 100%)',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isActive ? '0 0 24px rgba(6, 182, 212, 0.25)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.4rem' }}>{ds.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>
                            {ds.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {ds.subtitle}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                          color: isActive ? '#34d399' : '#94a3b8',
                          border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                        }}
                      >
                        {isActive ? '● ACTIVE' : ds.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45, margin: '8px 0' }}>
                      {ds.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                      <span>Source: <strong style={{ color: '#cbd5e1' }}>{ds.source}</strong></span>
                      <span>•</span>
                      <span>POIs: <strong style={{ color: '#38bdf8' }}>{ds.pois?.length || 0} nodes</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Spawn: [{ds.spawnPosition.join(', ')}]
                    </div>

                    <button
                      onClick={() => onSelectDataset?.(ds.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 10,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isActive ? '1px solid rgba(56, 189, 248, 0.5)' : 'none',
                        background: isActive
                          ? 'rgba(56, 189, 248, 0.2)'
                          : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                        color: '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Play size={12} fill="#ffffff" />
                      <span>{isActive ? 'View in 3D' : 'Stream Scene'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. PLAYSTATION "ACTIVITY CARDS" GRID (INDOOR POIS) */}
        {/* ================================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                SPATIAL AMENITIES & ACTIVITY CARDS
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                Instant access to accessible indoor pins. Select any activity to inspect specs or teleport directly into the 3D twin.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.74rem',
                color: '#38bdf8',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <Radio size={14} />
              <span>{pois.length} ACTIVE RADAR BEACONS</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20,
            }}
          >
            {pois.map((poi) => {
              const cat = POI_CATEGORIES[poi.category] || POI_CATEGORIES.accessible_ramp;
              const isHovered = hoveredCard === poi.id;

              return (
                <div
                  key={poi.id}
                  className="glass-panel ps5-card"
                  onMouseEnter={() => setHoveredCard(poi.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    borderRadius: 22,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                    background: isHovered
                      ? 'linear-gradient(135deg, rgba(20, 30, 55, 0.95) 0%, rgba(12, 18, 36, 0.98) 100%)'
                      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 29, 0.95) 100%)',
                    border: isHovered ? `1px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isHovered
                      ? `0 16px 36px -10px rgba(0, 0, 0, 0.8), 0 0 24px ${cat.color}44`
                      : '0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {/* Card Header: Category & Clearance */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 999,
                        backgroundColor: `${cat.color}22`,
                        border: `1px solid ${cat.color}55`,
                        padding: '3px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: cat.color,
                        textTransform: 'uppercase',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                        }}
                      />
                      <span>{cat.label}</span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                      }}
                    >
                      Clearance: {poi.clearanceCm}cm
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {poi.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      {poi.description}
                    </p>
                  </div>

                  {/* Key Features Bullet List */}
                  {poi.features && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {poi.features.slice(0, 2).map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                          }}
                        >
                          <CheckCircle2 size={12} color={cat.color} style={{ shrink: 0 }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#94a3b8' }}>
                      <MapPin size={13} color="#38bdf8" />
                      <span>[{poi.position[0]}, {poi.position[1]}, {poi.position[2]}]</span>
                    </div>

                    <button
                      onClick={() => onSelectPoi?.(poi)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: `1px solid ${cat.color}`,
                        backgroundColor: `${cat.color}22`,
                        color: '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = cat.color;
                        e.currentTarget.style.color = '#000000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${cat.color}22`;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                    >
                      <span>Teleport in 3D</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 4. LIVE IOT ENVIRONMENTAL & SAFETY MATRIX */}
        {/* ================================================================ */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 24,
            padding: '28px 32px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 29, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={20} color="#38bdf8" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  LIVE VENUE & ENVIRONMENTAL TELEMETRY
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                  Synchronized indoor environmental monitoring sensors across Showroom Zone 3.
                </p>
              </div>
            </div>

            <span
              style={{
                borderRadius: 999,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              Sensors Online (4/4)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {/* Sensor 1: Temperature */}
            <div
              style={{
                borderRadius: 14,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Thermometer size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Indoor Temp</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>21.6 °C</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Optimal Comfort</div>
              </div>
            </div>

            {/* Sensor 2: Acoustic Noise Floor */}
            <div
              style={{
                borderRadius: 14,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Volume2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Acoustic Floor</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>41.8 dB</div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Low Ambience</div>
              </div>
            </div>

            {/* Sensor 3: Air Quality Index */}
            <div
              style={{
                borderRadius: 14,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Wind size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Air Quality (AQI)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>24 AQI</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Pristine Fresh</div>
              </div>
            </div>

            {/* Sensor 4: Egress Evacuation Readiness */}
            <div
              style={{
                borderRadius: 14,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <Compass size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Emergency Egress</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Clear (0/0)</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>North Route Open</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 5. NEXT-GEN FUTURE SPATIAL TWIN & AR WAYFINDING GALLERY */}
        {/* ================================================================ */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 24,
            padding: '28px 32px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 29, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  NEXT-GEN SPATIAL TWIN & AR NAVIGATION CONSOLE
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                  Visualizing future holographic spatial computing, real-time Gaussian splat rendering, and accessible AR corridors.
                </p>
              </div>
            </div>

            <button
              onClick={() => onLaunch3D('first_person')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Navigation size={13} />
              <span>Launch Live 3D Twin</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {/* Future Image 1: Holographic Spatial Console */}
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9' }}>
                <img
                  src="/assets/future_spatial_twin.jpg"
                  alt="Future Spatial Twin Holographic Console"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Holographic Spatial Glass
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Aegis H-Glass Command Terminal
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Zero-latency volumetric rendering of Gaussian splats with dynamic spatial bounding, point cloud telemetry, and facility management analytics.
                </div>
              </div>
            </div>

            {/* Future Image 2: AR Indoor HUD & Accessible Wayfinding */}
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9' }}>
                <img
                  src="/assets/future_indoor_hud.jpg"
                  alt="Future AR Indoor Wayfinding HUD"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  AR Wayfinding Ribbon
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                  Accessible Turn-by-Turn Wayfinding
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  First-person augmented reality guidance corridor highlighting ADA 1:12 compliant ramps, obstacle warning indicators, and tactile floor paths.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            fontSize: '0.76rem',
            color: '#64748b',
          }}
        >
          <div>
            AegisIndoor 3D: Intelligent Spatial Navigation Engine • Spatial Digital Twin Platform
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: '#38bdf8' }}>WebGL 2.0</span>
            <span>•</span>
            <span style={{ color: '#38bdf8' }}>3D Gaussian Splats</span>
            <span>•</span>
            <span style={{ color: '#38bdf8' }}>Dual-Mode A* Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
