import React, { useState, useEffect } from 'react';
import {
  Globe,
  Link2,
  FileCode,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { playUiClick, playArrivalChime, playWarningBuzz } from '../utils/audio';
import { resolveSplatUrl } from '../utils/splatUrlResolver';

const QUICK_PRESETS = [
  {
    name: 'Fountain Plaza Courtyard (fountain_photo.splat)',
    url: 'https://huggingface.co/datasets/stpete2/splat/resolve/main/fountain_photo.splat',
    format: 'splat',
    source: 'Hugging Face / splat-three',
  },
  {
    name: 'HuggingFace Room (Indoor Living Suite)',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/room/room.splat',
    format: 'splat',
    source: 'Hugging Face CDN',
  },
  {
    name: 'HuggingFace Bonsai (Botanical Studio)',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai.splat',
    format: 'splat',
    source: 'Hugging Face CDN',
  },
  {
    name: 'HuggingFace Garden (Courtyard Capture)',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/garden/garden.splat',
    format: 'splat',
    source: 'Hugging Face CDN',
  },
];

export default function RemoteUrlModal({ isOpen, onClose, onApplyRemoteDataset }) {
  const [modelUrl, setModelUrl] = useState('');
  const [poiUrl, setPoiUrl] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setErrorMsg(null);
      if (!modelUrl) {
        setModelUrl(QUICK_PRESETS[0].url);
        setDatasetName(QUICK_PRESETS[0].name);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setModelUrl(preset.url);
    setDatasetName(preset.name);
    setErrorMsg(null);
    playUiClick();
  };

  const handleStream = async () => {
    setErrorMsg(null);
    const rawInput = modelUrl.trim();
    if (!rawInput) {
      setErrorMsg('Please enter a valid remote 3D model HTTPS URL or shortcut (e.g., fountain_photo.splat).');
      playWarningBuzz();
      return;
    }

    // Smart resolution: handles splat-three.vercel.app URLs, shortcuts, and direct CDN links
    const trimmedModelUrl = resolveSplatUrl(rawInput);

    if (!trimmedModelUrl.startsWith('http://') && !trimmedModelUrl.startsWith('https://')) {
      setErrorMsg('Model URL could not be resolved. Please enter a valid URL or recognized model name.');
      playWarningBuzz();
      return;
    }

    setIsLoading(true);
    let parsedPois = null;

    if (poiUrl.trim()) {
      try {
        const res = await fetch(poiUrl.trim());
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          parsedPois = data;
        } else if (data.features && Array.isArray(data.features)) {
          parsedPois = data.features.map((f, i) => ({
            id: `poi-remote-${i}`,
            title: f.properties?.title || f.properties?.name || `Remote Node ${i + 1}`,
            category: f.properties?.category || 'accessible_ramp',
            position: [f.geometry?.coordinates?.[0] || 0, 1.2, f.geometry?.coordinates?.[1] || 0],
            clearanceCm: f.properties?.clearanceCm || 150,
            description: f.properties?.description || 'Remote GeoJSON spatial POI',
            tags: ['remote', 'stream'],
            status: 'Streamed',
          }));
        }
      } catch (err) {
        console.warn('Could not fetch custom POI URL:', err);
      }
    }

    setIsLoading(false);
    playArrivalChime();

    onApplyRemoteDataset({
      name: datasetName.trim() || 'Custom Remote 3D Stream',
      splatUrl: trimmedModelUrl,
      poisUrl: poiUrl.trim() || null,
      poisData: parsedPois,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(10, 15, 29, 0.98) 100%)',
          borderRadius: 20,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                Stream Remote 3D Scene
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    color: '#38bdf8',
                    fontWeight: 600,
                  }}
                >
                  LIVE CDN
                </span>
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Paste any HTTPS .splat, .ply, or .ksplat URL to stream Gaussian Splats into NAVI-3D
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              playUiClick();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick Presets Bar */}
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color="#f59e0b" />
              <span>TESTED HUGGING FACE 3DGS PRESETS:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {QUICK_PRESETS.map((preset) => {
                const isSelected = modelUrl === preset.url;
                return (
                  <button
                    key={preset.url}
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#f1f5f9' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>
                        {preset.url.slice(0, 60)}...
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#94a3b8',
                      }}
                    >
                      {preset.source}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
              3D Splat Stream URL (HTTPS): <span style={{ color: '#38bdf8' }}>*</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <Link2 size={16} color="#38bdf8" />
              <input
                type="url"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                placeholder="https://huggingface.co/.../room.splat"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '0.84rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Dataset Name Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
                Display Title:
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g. Living Suite Capture"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  padding: '9px 12px',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Optional POI JSON URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
                Remote POIs JSON (Optional):
              </label>
              <input
                type="url"
                value={poiUrl}
                onChange={(e) => setPoiUrl(e.target.value)}
                placeholder="https://.../pois.json"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  padding: '9px 12px',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.8rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <button
            onClick={() => {
              onClose();
              playUiClick();
            }}
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleStream}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 20px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>{isLoading ? 'Connecting...' : 'Stream 3D Scene Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
