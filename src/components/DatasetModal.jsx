import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Box,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  Database,
  Info,
  Sliders,
  FileSpreadsheet,
  Code,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { analyzeAnyFile, SAMPLE_DATASET_PRESETS, CATEGORY_MAPPINGS } from '../utils/fileAnalyzer';
import { playUiClick, playArrivalChime, playWarningBuzz } from '../utils/audio';

export default function DatasetModal({
  isOpen,
  onClose,
  onApplyDataset,
  onResetDefault,
  currentDatasetType,
  currentPoiCount,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [modelFile, setModelFile] = useState(null);
  const [poiFile, setPoiFile] = useState(null);
  const [parsedPois, setParsedPois] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Universal input: NO accept restriction whatsoever (accepts ANY file format)
  const universalInputRef = useRef(null);

  // Auto-release pointer lock whenever modal opens & reset state
  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process dropped or selected files - ACCEPTS ANY FILE FORMAT
  const processFiles = async (files) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);
    playUiClick();

    let foundModel = false;
    let foundPoi = false;

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        // 3D Splat/Mesh files
        if (['.splat', '.ply', '.ksplat', '.spz'].includes(ext)) {
          setModelFile(file);
          foundModel = true;
          setSuccessMsg(`Loaded 3D Point Cloud Model: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        } else {
          // ANY OTHER FILE: CSV, TSV, JSON, GeoJSON, Floorplans, Text logs, PDF, CAD, Doc, Audio, or Binary
          const analysis = await analyzeAnyFile(file);
          if (analysis.pois && analysis.pois.length > 0) {
            setPoiFile(file);
            setParsedPois(analysis.pois);
            setCurrentAnalysis(analysis);
            foundPoi = true;
            setSuccessMsg(
              `Analyzed & extracted ${analysis.pois.length} indoor nodes from ${file.name} (Grade ${analysis.grade}, ${analysis.compliancePercentage}% ADA Compliance)`
            );
            playArrivalChime();
          } else {
            setErrorMsg(`Could not extract spatial features from ${file.name}.`);
            playWarningBuzz();
          }
        }
      }
    } catch (err) {
      setErrorMsg(`Error reading file: ${err.message}`);
      playWarningBuzz();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleApply = () => {
    if (!modelFile && !parsedPois) {
      setErrorMsg('Please select or drop ANY file to ingest and visualize in the 3D twin.');
      return;
    }

    playUiClick();
    onApplyDataset({
      modelFile,
      pois: parsedPois,
      analysis: currentAnalysis,
    });
    onClose();
  };

  const handleLoadSample = (preset) => {
    const file = preset.createFile();
    processFiles([file]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.86)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 125,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 680,
          borderRadius: 24,
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(0, 112, 209, 0.45)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 112, 209, 0.25)',
          padding: 26,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#f8fafc',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 14,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 16px rgba(192, 38, 211, 0.4)',
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                  Universal File & Dataset Ingestion
                </h2>
                <span
                  style={{
                    borderRadius: 999,
                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                    padding: '2px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  Any Format (*.*)
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3, margin: 0 }}>
                Upload <strong>ANY file format</strong> (CSV, Excel, JSON, GeoJSON, Floorplans, 3D Splat/Mesh, PDF, CAD, or Text Logs) to analyze & project into the 3D twin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drag and Drop Zone - ACCEPTS ANY FILE */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => universalInputRef.current?.click()}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            borderRadius: 18,
            border: dragActive ? '2px dashed #38bdf8' : '2px dashed rgba(255, 255, 255, 0.22)',
            backgroundColor: dragActive ? 'rgba(6, 182, 212, 0.14)' : 'rgba(10, 15, 29, 0.65)',
            padding: '24px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 112, 209, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              boxShadow: '0 4px 16px rgba(0, 112, 209, 0.35)',
            }}
          >
            <UploadCloud size={26} />
          </div>

          <div>
            <p style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {isProcessing ? 'Ingesting & Analyzing File...' : 'Drag & Drop ANY file here, or click to browse'}
            </p>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 4, margin: 0 }}>
              Accepts <strong>ANY format</strong>: <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>.csv</span>,{' '}
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>.json</span>,{' '}
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>.geojson</span>,{' '}
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>.png/.jpg/.svg</span>,{' '}
              <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>.txt/.log</span>,{' '}
              <span style={{ color: '#a855f7', fontFamily: 'monospace' }}>.splat/.ply</span>,{' '}
              <span style={{ color: '#ec4899', fontFamily: 'monospace' }}>.pdf/.xlsx/.doc</span>, or any document.
            </p>
          </div>

          {/* SINGLE UNIVERSAL FILE INPUT: NO RESTRICTION ON ACCEPT (ANY FILE) */}
          <input
            ref={universalInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.length && processFiles(e.target.files)}
          />

          {/* Primary Universal Browse Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                universalInputRef.current?.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 12,
                border: '1px solid rgba(56, 189, 248, 0.7)',
                background: 'linear-gradient(135deg, #00439c 0%, #0070d1 100%)',
                padding: '9px 20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(0, 112, 209, 0.5)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 112, 209, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 112, 209, 0.5)';
              }}
            >
              <UploadCloud size={16} />
              <span>Browse Any File (*.*)</span>
            </button>
          </div>

          {/* 1-Click Test Sample Presets */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Quick Samples:
            </span>
            {SAMPLE_DATASET_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLoadSample(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 10,
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: p.color,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.borderColor = p.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                {p.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Files & Analytics Card Overview */}
        {(modelFile || poiFile) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {modelFile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 14,
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      borderRadius: 10,
                      backgroundColor: 'rgba(6, 182, 212, 0.25)',
                      padding: 8,
                      color: '#38bdf8',
                    }}
                  >
                    <Box size={18} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 200,
                      }}
                    >
                      {modelFile.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                      3D Model • {formatFileSize(modelFile.size)} • ~{Math.round(modelFile.size / 32).toLocaleString()} splats
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModelFile(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Remove 3D model"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {poiFile && parsedPois && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 14,
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      borderRadius: 10,
                      backgroundColor: 'rgba(56, 189, 248, 0.25)',
                      padding: 8,
                      color: '#38bdf8',
                    }}
                  >
                    <Sliders size={18} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 200,
                      }}
                    >
                      {poiFile.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 2 }}>
                      {parsedPois.length} Indoor Nodes • ADA Score:{' '}
                      <strong style={{ color: currentAnalysis?.compliancePercentage >= 85 ? '#34d399' : '#fbbf24' }}>
                        {currentAnalysis?.compliancePercentage || 95}% (Grade {currentAnalysis?.grade || 'A'})
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPoiFile(null);
                    setParsedPois(null);
                    setCurrentAnalysis(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
              border: '1px solid rgba(244, 63, 94, 0.4)',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#fda4af',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, color: '#f43f5e' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && !errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#6ee7b7',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10b981' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              padding: '9px 16px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={14} color="#94a3b8" />
            Reset to Default
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: 10,
                padding: '9px 16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!modelFile && !parsedPois}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 12,
                padding: '9px 22px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: modelFile || parsedPois ? 'pointer' : 'not-allowed',
                border: 'none',
                background:
                  modelFile || parsedPois
                    ? 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)'
                    : 'rgba(30, 41, 59, 0.5)',
                color: modelFile || parsedPois ? '#ffffff' : '#64748b',
                boxShadow: modelFile || parsedPois ? '0 0 20px rgba(192, 38, 211, 0.5)' : 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (modelFile || parsedPois) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (modelFile || parsedPois) e.currentTarget.style.transform = 'none';
              }}
            >
              <Sparkles size={15} />
              <span>Apply to 3D Scene</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
