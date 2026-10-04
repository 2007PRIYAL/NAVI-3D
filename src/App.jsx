import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import SplatViewer from './components/SplatViewer';
import DirectorySidebar from './components/DirectorySidebar';
import RightMapTelemetryTray from './components/RightMapTelemetryTray';
import NavigationHud from './components/NavigationHud';
import CommandPalette from './components/CommandPalette';
import DatasetModal from './components/DatasetModal';
import RemoteUrlModal from './components/RemoteUrlModal';
import FloorSwitcher from './components/FloorSwitcher';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import NotificationsPopover from './components/NotificationsPopover';
import { MOCK_POIS, FLOOR_LEVELS } from './data/mockPois.js';
import { REMOTE_DATASETS, getDatasetById } from './data/remoteDatasets.js';
import { findPath, calculateDatasetBounds } from './utils/pathfinding.js';
import {
  playArrivalChime,
  playNavigationStart,
  playUiClick,
  isMuted as checkAudioMuted,
  setMuted as setAudioMuted,
  toggleMute as toggleAudioMuted,
} from './utils/audio';
import { getStoredUserSync, getCurrentUser } from './services/authApi';
import {
  Compass,
  Search,
  Bell,
  Building2,
  ChevronDown,
  X,
  Footprints,
  Layers,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { resolveSplatUrl, KNOWN_SPLAT_MODELS } from './utils/splatUrlResolver.js';

// Parse URL query parameter (?url=fountain_photo.splat or ?dataset=...) on load
function getInitialDatasetConfig() {
  if (typeof window === 'undefined') return { dataset: REMOTE_DATASETS[0] };
  try {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get('url') || params.get('splat') || params.get('model');
    const datasetParam = params.get('dataset');

    if (rawUrl) {
      const resolved = resolveSplatUrl(rawUrl);
      if (rawUrl.toLowerCase().includes('fountain') || resolved.toLowerCase().includes('fountain')) {
        const found = REMOTE_DATASETS.find((d) => d.id === 'fountain_plaza');
        if (found) return { dataset: found };
      }
      const matched = REMOTE_DATASETS.find((d) => d.splatUrl === resolved || d.id === rawUrl);
      if (matched) return { dataset: matched };

      const fileName = rawUrl.split('/').pop().split('?')[0] || 'Remote 3DGS Model';
      const customDs = {
        id: 'param_remote_' + Date.now(),
        name: fileName,
        source: 'URL Parameter',
        badge: 'URL Stream',
        type: 'splat',
        splatUrl: resolved,
        spawnPosition: [0, 1.6, 3.8],
        spawnLookAt: [0, 1.0, 0],
        bounds: { minX: -6, maxX: 6, minZ: -6, maxZ: 6 },
        floors: [FLOOR_LEVELS[0]],
        pois: [],
      };
      return { dataset: customDs, isCustom: true };
    }

    if (datasetParam) {
      const matched = REMOTE_DATASETS.find((d) => d.id === datasetParam);
      if (matched) return { dataset: matched };
    }
  } catch (e) {
    console.warn('URL param parse error:', e);
  }
  return { dataset: REMOTE_DATASETS[0] };
}

const initialConfig = getInitialDatasetConfig();

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [mode, setMode] = useState('walk'); // 'walk' | 'wheelchair'
  const [fps, setFps] = useState(60);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: 'ready', message: 'Ready' });
  const [currentFloorLevel, setCurrentFloorLevel] = useState(0); // Multi-Storey Level (0: Ground, 1: Mezzanine, 2: Terrace)

  // Dataset State
  const [selectedDatasetId, setSelectedDatasetId] = useState(initialConfig.dataset.id);
  const [datasetType, setDatasetType] = useState(initialConfig.dataset.type);
  const [pois, setPois] = useState(initialConfig.dataset.pois || REMOTE_DATASETS[0].pois);
  const [customDataset, setCustomDataset] = useState(initialConfig.isCustom ? initialConfig.dataset : null);
  const [customModel, setCustomModel] = useState(null);

  // Modals & Panels State
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isRemoteUrlModalOpen, setIsRemoteUrlModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // User Authentication & SQLite Identity
  const [currentUser, setCurrentUser] = useState(() => getStoredUserSync());

  // Audio Mute State
  const [audioMuted, setAudioMutedState] = useState(() => checkAudioMuted());

  // Building Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Ground Floor Egress Active',
      message: 'Clear evacuation access verified to North Emergency Exit.',
      time: '5m ago',
      type: 'alert',
      read: false,
    },
    {
      id: 2,
      title: 'Priority Braille Elevator',
      message: 'Operating with full ADA compliance across Levels 0, 1, and 2.',
      time: '25m ago',
      type: 'access',
      read: false,
    },
    {
      id: 3,
      title: 'ADA 1:12 Incline Ramp Certified',
      message: 'Continuous step-free path ready between Ground and Mezzanine.',
      time: '1h ago',
      type: 'info',
      read: true,
    },
  ]);

  // Load active session user if available
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setCurrentUser(u);
    }).catch(() => {});
  }, []);

  const handleToggleAudioMute = useCallback(() => {
    const nextMuted = toggleAudioMuted();
    setAudioMutedState(nextMuted);
    playUiClick();
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Navigation & POI State
  const [targetPoi, setTargetPoi] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [navigationTargetPoi, setNavigationTargetPoi] = useState(null);
  const [activeRouteWaypoints, setActiveRouteWaypoints] = useState(null);
  const [playerCoords, setPlayerCoords] = useState({
    x: initialConfig.dataset.spawnPosition ? initialConfig.dataset.spawnPosition[0] : 0,
    y: initialConfig.dataset.spawnPosition ? initialConfig.dataset.spawnPosition[1] : 1.6,
    z: initialConfig.dataset.spawnPosition ? initialConfig.dataset.spawnPosition[2] : 4.0,
    yaw: 0,
    dirX: 0,
    dirZ: -1,
  });
  const [flyToPoi, setFlyToPoi] = useState(null);

  // View & UI State
  const [viewMode, setViewMode] = useState('first_person'); // 'first_person' (Roam) | 'dollhouse' (Overview)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minimapZoom, setMinimapZoom] = useState(1.0);

  const minimapRef = useRef(null);
  const hasArrivedRef = useRef(false);
  const navigationTargetPoiRef = useRef(navigationTargetPoi);

  useEffect(() => {
    navigationTargetPoiRef.current = navigationTargetPoi;
  }, [navigationTargetPoi]);

  // Active dataset definition
  const currentDataset = useMemo(() => {
    if (customDataset && customDataset.id === selectedDatasetId) {
      return customDataset;
    }
    return getDatasetById(selectedDatasetId);
  }, [selectedDatasetId, customDataset]);

  const activeSplatUrl =
    datasetType === 'splat'
      ? (customDataset?.id === selectedDatasetId ? customDataset.splatUrl : currentDataset.splatUrl)
      : customModel?.url || '';

  // Dataset Grid Bounds for Pathfinding
  const datasetBounds = useMemo(() => {
    return calculateDatasetBounds(pois, currentDataset?.bounds);
  }, [pois, currentDataset]);

  // Is modal overlay open
  const isOverlayActive = Boolean(
    isPaletteOpen ||
    isDatasetModalOpen ||
    isRemoteUrlModalOpen ||
    isAuthModalOpen ||
    isUserProfileOpen ||
    isNotificationsOpen
  );

  // Cursor Hygiene: Keep system cursor visible when not roaming or when modals open
  useEffect(() => {
    if (isOverlayActive || viewMode === 'dollhouse') {
      document.body.style.cursor = 'default';
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else if (isLocked) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }
  }, [isOverlayActive, isLocked, viewMode]);

  // Keyboard Shortcuts (Cmd+K, Tab, M, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        return;
      }

      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          setViewMode((prev) => (prev === 'first_person' ? 'dollhouse' : 'first_person'));
          playUiClick();
          return;
        }

        if (e.key === 'Tab') {
          e.preventDefault();
          setIsSidebarOpen((prev) => !prev);
          playUiClick();
          return;
        }

        // Camera vantage presets & POI shortcuts (inspired by splat-three 0-9 cameras)
        if (!isLocked && pois && pois.length > 0) {
          if (e.key === '0') {
            e.preventDefault();
            const resetPoi = {
              id: 'spawn_origin',
              title: currentDataset.name || 'Origin View',
              position: currentDataset.spawnPosition || [0, 1.6, 4.0],
            };
            setSelectedPoi(null);
            setFlyToPoi(resetPoi);
            playUiClick();
            return;
          }

          const num = parseInt(e.key, 10);
          if (!isNaN(num) && num >= 1 && num <= 9) {
            const target = pois[num - 1];
            if (target) {
              e.preventDefault();
              setSelectedPoi(target);
              playUiClick();
              return;
            }
          }

          if (e.key === '[' || e.key === ']') {
            e.preventDefault();
            const currIdx = selectedPoi ? pois.findIndex((p) => p.id === selectedPoi.id) : -1;
            const nextIdx =
              e.key === ']'
                ? (currIdx + 1) % pois.length
                : (currIdx - 1 + pois.length) % pois.length;
            const target = pois[nextIdx];
            if (target) {
              setSelectedPoi(target);
              playUiClick();
              return;
            }
          }
        }
      }

      if (e.key === 'Escape') {
        if (isPaletteOpen) {
          setIsPaletteOpen(false);
        } else if (isDatasetModalOpen) {
          setIsDatasetModalOpen(false);
        } else if (isRemoteUrlModalOpen) {
          setIsRemoteUrlModalOpen(false);
        } else if (navigationTargetPoi) {
          handleClearNavigation();
        } else if (selectedPoi) {
          setSelectedPoi(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPoi, isPaletteOpen, isDatasetModalOpen, isRemoteUrlModalOpen, navigationTargetPoi, pois, currentDataset, isLocked]);

  // Handle browser back/forward history navigation (?url=... / ?dataset=...)
  useEffect(() => {
    const handlePopState = () => {
      const config = getInitialDatasetConfig();
      if (config.dataset) {
        setSelectedDatasetId(config.dataset.id);
        setDatasetType(config.dataset.type);
        setPois(config.dataset.pois || REMOTE_DATASETS[0].pois);
        setCustomDataset(config.isCustom ? config.dataset : null);
        setCustomModel(null);
        setActiveRouteWaypoints(null);
        setSelectedPoi(null);
        setNavigationTargetPoi(null);
        if (config.dataset.spawnPosition) {
          setPlayerCoords({
            x: config.dataset.spawnPosition[0],
            y: config.dataset.spawnPosition[1],
            z: config.dataset.spawnPosition[2],
            yaw: 0,
            dirX: 0,
            dirZ: -1,
          });
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route calculation with Multi-Floor Stitching
  const computeRoute = useCallback(
    (destinationPoi, navigationMode, currentPos, floorOverride) => {
      if (!destinationPoi) {
        setActiveRouteWaypoints(null);
        return;
      }
      const profile = navigationMode === 'wheelchair' ? 'accessible' : 'standard';
      const startFloor = floorOverride !== undefined ? floorOverride : (currentPos?.floor ?? currentFloorLevel);
      const targetFloor = destinationPoi.floor ?? 0;

      const waypoints = findPath(
        { ...currentPos, floor: startFloor },
        {
          x: destinationPoi.position[0],
          y: destinationPoi.position[1],
          z: destinationPoi.position[2],
          floor: targetFloor,
        },
        profile,
        datasetBounds
      );
      setActiveRouteWaypoints(waypoints);
    },
    [datasetBounds, currentFloorLevel]
  );

  // Multi-Storey Floor Selection
  const handleSelectFloor = useCallback(
    (floorLevel) => {
      setCurrentFloorLevel(floorLevel);
      playUiClick();
      if (navigationTargetPoi) {
        computeRoute(navigationTargetPoi, mode, { ...playerCoords, floor: floorLevel }, floorLevel);
      }
    },
    [navigationTargetPoi, mode, playerCoords, computeRoute]
  );

  // Start Navigation to POI
  const handleStartNavigation = useCallback(
    (poi) => {
      hasArrivedRef.current = false;
      setSelectedPoi(poi);
      setNavigationTargetPoi(poi);
      computeRoute(poi, mode, { ...playerCoords, floor: currentFloorLevel });
      playNavigationStart();
    },
    [mode, playerCoords, currentFloorLevel, computeRoute]
  );

  // Clear Navigation Route
  const handleClearNavigation = useCallback(() => {
    hasArrivedRef.current = false;
    setNavigationTargetPoi(null);
    setActiveRouteWaypoints(null);
    playUiClick();
  }, []);

  // Cinematic Camera Flyover
  const handleFlyover = useCallback((poi) => {
    playUiClick();
    setFlyToPoi({ ...poi, timestamp: Date.now() });
  }, []);

  // Reset Camera to Spawn Origin
  const handleResetCameraOrigin = useCallback(() => {
    playUiClick();
    const spawn = currentDataset?.spawnPosition || [0, 1.6, 4.0];
    setFlyToPoi({
      id: 'origin_view_' + Date.now(),
      title: 'Origin View',
      position: spawn,
      timestamp: Date.now(),
    });
  }, [currentDataset]);

  // Dataset dropdown change
  const handleDatasetChange = (newId) => {
    if (newId === 'custom') {
      setIsDatasetModalOpen(true);
      return;
    }
    if (newId === 'remote_url') {
      setIsRemoteUrlModalOpen(true);
      return;
    }

    const ds = REMOTE_DATASETS.find((d) => d.id === newId);
    if (ds) {
      setSelectedDatasetId(ds.id);
      setDatasetType(ds.type);
      setPois(ds.pois || MOCK_POIS);
      setCustomModel(null);
      setActiveRouteWaypoints(null);
      setSelectedPoi(null);
      setNavigationTargetPoi(null);
      setTargetPoi(null);
      setCurrentFloorLevel(0);
      setPlayerCoords({
        x: ds.spawnPosition[0],
        y: ds.spawnPosition[1],
        z: ds.spawnPosition[2],
        yaw: 0,
        dirX: 0,
        dirZ: -1,
      });

      // Synchronize browser address bar URL cleanly without page refresh
      try {
        if (typeof window !== 'undefined' && window.history) {
          if (ds.id === 'fountain_plaza') {
            window.history.replaceState(null, '', '?url=fountain_photo.splat');
          } else if (ds.id === 'real_world_interior') {
            window.history.replaceState(null, '', '?url=room.splat');
          } else if (ds.id === 'artisan_studio') {
            window.history.replaceState(null, '', '?url=bonsai.splat');
          } else if (ds.id === 'procedural') {
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            window.history.replaceState(null, '', `?dataset=${ds.id}`);
          }
        }
      } catch (err) {
        // Ignore sandboxed iframe history errors
      }

      playUiClick();
    }
  };

  // Apply custom local model from modal
  const handleApplyCustomDataset = useCallback(({ modelFile, pois: newPois }) => {
    if (newPois && Array.isArray(newPois) && newPois.length > 0) {
      setPois(newPois);
      setSelectedPoi(newPois[0]);
      setFlyToPoi(newPois[0]);
    }
    if (modelFile) {
      const url = URL.createObjectURL(modelFile);
      setCustomModel({ file: modelFile, url });
      setDatasetType('custom');
      setSelectedDatasetId('custom');
      playUiClick();
    }
  }, []);

  // Reset to default
  const handleResetDefaultDataset = useCallback(() => {
    const defaultDs = REMOTE_DATASETS[0];
    setPois(defaultDs.pois);
    setCustomModel(null);
    setCustomDataset(null);
    setDatasetType(defaultDs.type);
    setSelectedDatasetId(defaultDs.id);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
    playUiClick();
  }, []);

  // Stream remote dataset from URL
  const handleApplyRemoteUrl = useCallback(({ name, splatUrl, poisData }) => {
    const datasetPois = Array.isArray(poisData) && poisData.length > 0 ? poisData : REMOTE_DATASETS[0].pois;
    const customDs = {
      id: 'custom_remote_' + Date.now(),
      name: name || 'Custom Remote 3D Stream',
      source: 'Remote HTTPS CDN',
      badge: 'Remote Stream',
      type: 'splat',
      splatUrl: splatUrl,
      spawnPosition: [0, 1.6, 2.5],
      spawnLookAt: [0, 1.2, 0],
      bounds: { minX: -6, maxX: 6, minZ: -6, maxZ: 6 },
      pois: datasetPois,
    };
    setCustomDataset(customDs);
    setSelectedDatasetId(customDs.id);
    setDatasetType('splat');
    setPois(datasetPois);
    setCustomModel(null);
    setActiveRouteWaypoints(null);
    setSelectedPoi(null);
    setNavigationTargetPoi(null);

    try {
      if (typeof window !== 'undefined' && window.history) {
        const shortMatch = Object.entries(KNOWN_SPLAT_MODELS || {}).find(([, d]) => d.url === splatUrl);
        const paramVal = shortMatch ? shortMatch[0] : splatUrl;
        window.history.replaceState(null, '', `?url=${encodeURIComponent(paramVal)}`);
      }
    } catch (e) {}

    playArrivalChime();
  }, []);

  // Mode Toggle (Walk <-> Wheelchair)
  const toggleMode = useCallback(() => {
    playUiClick();
    setMode((prev) => {
      const next = prev === 'walk' ? 'wheelchair' : 'walk';
      if (navigationTargetPoi) {
        computeRoute(navigationTargetPoi, next, playerCoords);
      }
      return next;
    });
  }, [navigationTargetPoi, computeRoute, playerCoords]);

  // Player position update from 3D scene with arrival detection
  const handlePlayerMove = useCallback((x, z, yaw, y = 1.6, dirX = 0, dirZ = -1) => {
    if (minimapRef.current) {
      minimapRef.current.updatePlayer(x, z, yaw);
    }
    setPlayerCoords((prev) => {
      if (
        Math.abs(prev.x - x) > 0.15 ||
        Math.abs(prev.z - z) > 0.15 ||
        Math.abs(prev.y - y) > 0.15 ||
        Math.abs(prev.yaw - yaw) > 0.08
      ) {
        return { x, y, z, yaw, dirX, dirZ };
      }
      return prev;
    });

    // Arrival detection (<= 1.5m radius on matching floor)
    if (navigationTargetPoiRef.current && !hasArrivedRef.current) {
      const destPoi = navigationTargetPoiRef.current;
      const destPos = destPoi.position;
      const destFloor = destPoi.floor ?? 0;
      const dist = Math.hypot(x - destPos[0], z - destPos[2]);
      if (dist <= 1.5 && (currentFloorLevel === destFloor)) {
        hasArrivedRef.current = true;
        playArrivalChime();
        setTimeout(() => {
          setNavigationTargetPoi(null);
          setActiveRouteWaypoints(null);
          hasArrivedRef.current = false;
        }, 3000);
      }
    }
  }, [currentFloorLevel]);

  // Handle live route progression & trimmed waypoints from 3D viewport
  const handleRouteProgress = useCallback((remainingWaypoints) => {
    setActiveRouteWaypoints(remainingWaypoints);
  }, []);

  // Live remaining distance to target along remaining waypoints
  const liveRouteDistance = useMemo(() => {
    if (!navigationTargetPoi) return 0;
    if (activeRouteWaypoints && activeRouteWaypoints.length > 0) {
      let d = 0;
      let curr = playerCoords;
      for (const pt of activeRouteWaypoints) {
        d += Math.hypot(pt.x - curr.x, pt.z - curr.z);
        curr = pt;
      }
      return d;
    }
    return Math.hypot(playerCoords.x - navigationTargetPoi.position[0], playerCoords.z - navigationTargetPoi.position[2]);
  }, [navigationTargetPoi, playerCoords, activeRouteWaypoints]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* =========================================================================
          ZONE 1: TOP NAVIGATION HEADER (h-16, bg-white, border-b border-slate-200, px-6)
          ========================================================================= */}
      <header
        onMouseEnter={() => {
          if (document.pointerLockElement) document.exitPointerLock?.();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64, // h-16
          zIndex: 30,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Left Brand: Official NAVI-3D Logo + NAVI-3D typography + expanded monospace subtitle + 60 FPS live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/logo.png"
            alt="NAVI-3D Logo"
            style={{ height: 38, width: 38, objectFit: 'contain' }}
            className="drop-shadow-sm"
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              NAVI-<span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3D</span>
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: '9px',
                letterSpacing: '0.06em',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginTop: 2,
                whiteSpace: 'nowrap',
              }}
            >
              NEURAL ACCESSIBILITY & VISION-GUIDED INDOOR 3D NAVIGATOR
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 10px',
              borderRadius: 9999,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#047857',
              marginLeft: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <span className="pulse-indicator" style={{ width: 6, height: 6 }} />
            <span>{fps} FPS • Engine Online</span>
          </div>
        </div>

        {/* Center Global Search Bar: Rounded-xl light input container (w-[420px]) */}
        <div
          onClick={() => setIsPaletteOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 420,
            maxWidth: '45%',
            padding: '8px 14px',
            borderRadius: 12, // rounded-xl
            background: '#f8fafc', // bg-slate-50
            border: '1px solid #e2e8f0', // border-slate-200
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Global Search (⌘K)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Search for rooms, people, amenities...
            </span>
          </div>
          <div className="keycap" style={{ flexShrink: 0 }}>
            ⌘ K
          </div>
        </div>

        {/* Right User / Venue Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          {/* Notification bell icon with unread dot */}
          <div
            onClick={() => {
              playUiClick();
              setIsNotificationsOpen((prev) => !prev);
            }}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 9,
              border: isNotificationsOpen ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: isNotificationsOpen ? '#eff6ff' : '#f8fafc',
              transition: 'all 0.12s ease',
            }}
            title="Building Alerts & Notifications"
          >
            <Bell size={16} color={isNotificationsOpen ? '#2563eb' : '#475569'} />
            {notifications.some((n) => !n.read) && (
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '1.5px solid #ffffff',
                }}
              />
            )}
          </div>

          {/* Notifications Popover Dropdown */}
          <NotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            isMuted={audioMuted}
            onToggleMute={handleToggleAudioMute}
          />

          {/* Venue Pill: Building icon + "Knowledge Park, Building A" with dropdown chevron */}
          <div
            onClick={() => setIsDatasetModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 9999,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            title="Click to Switch Venue / Dataset"
          >
            <Building2 size={14} color="#7C3AED" />
            <span>Knowledge Park, Building A</span>
            <ChevronDown size={13} color="#64748b" />
          </div>

          {/* User Profile Avatar & Name (Connected to SQLite DB) */}
          <div
            onClick={() => {
              playUiClick();
              setIsUserProfileOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 10,
              transition: 'background 0.12s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="User Profile & SQLite Database Account"
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                flexShrink: 0,
              }}
            >
              {currentUser?.avatar || 'AB'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.15 }}>
                {currentUser?.name || 'Amil Bhatt'}
              </span>
              <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 500 }}>
                {currentUser?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-SCREEN 3D SCENE VIEWPORT
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <SplatViewer
          dataset={currentDataset}
          splatUrl={activeSplatUrl}
          mode={mode}
          viewMode={viewMode}
          datasetType={datasetType}
          pois={pois}
          customModel={customModel}
          activeRouteWaypoints={activeRouteWaypoints}
          navigationTargetPoi={navigationTargetPoi}
          flyToPoi={flyToPoi}
          isOverlayActive={isOverlayActive}
          onLockChange={setIsLocked}
          onFpsUpdate={setFps}
          onProgress={setProgress}
          onStatusChange={setStatus}
          onTargetPoi={setTargetPoi}
          onSelectPoi={setSelectedPoi}
          onPlayerMove={handlePlayerMove}
          currentFloorLevel={currentFloorLevel}
          onFloorChange={handleSelectFloor}
          onRouteProgress={handleRouteProgress}
        />
      </div>

      {/* =========================================================================
          ZONE 2: LEFT DOCKED SPATIAL DIRECTORY (w-84, bg-white border-r)
          ========================================================================= */}
      <DirectorySidebar
        pois={pois}
        selectedPoi={selectedPoi}
        onSelectPoi={(poi) => {
          setSelectedPoi(poi);
        }}
        onStartNavigation={handleStartNavigation}
        playerCoords={playerCoords}
        currentFloorLevel={currentFloorLevel}
        onSelectFloor={handleSelectFloor}
        mode={mode}
        onToggleMode={toggleMode}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === 'first_person' ? 'dollhouse' : 'first_person'))}
        isMuted={audioMuted}
        onToggleMute={handleToggleAudioMute}
      />

      {/* =========================================================================
          ZONE 3: RIGHT LIVE MAP & TELEMETRY TRAY (w-72 fixed top-4 right-4 space-y-3)
          ========================================================================= */}
      <RightMapTelemetryTray
        minimapRef={minimapRef}
        pois={pois}
        bounds={datasetBounds}
        selectedPoi={selectedPoi}
        targetPoi={targetPoi}
        activeRouteWaypoints={activeRouteWaypoints}
        mode={mode}
        onSelectPoi={(poi) => {
          setSelectedPoi(poi);
        }}
        minimapZoom={minimapZoom}
        setMinimapZoom={setMinimapZoom}
        currentFloorLevel={currentFloorLevel}
        onSelectFloor={handleSelectFloor}
        floors={currentDataset.floors || FLOOR_LEVELS}
        playerCoords={playerCoords}
        navigationTargetPoi={navigationTargetPoi}
        liveRouteDistance={liveRouteDistance}
      />

      {/* =========================================================================
          ZONE 4: BOTTOM FLOATING TURN-BY-TURN NAVIGATION HUD (Active Navigation Banner)
          ========================================================================= */}
      <NavigationHud
        navigationTargetPoi={navigationTargetPoi}
        activeRouteWaypoints={activeRouteWaypoints}
        liveRouteDistance={liveRouteDistance}
        mode={mode}
        onToggleMode={toggleMode}
        onClearNavigation={handleClearNavigation}
        currentFloorLevel={currentFloorLevel}
      />

      {/* Reticle / Crosshair (Visible only when locked in first-person mode) */}
      <div
        className={`reticle ${isLocked && !isOverlayActive && viewMode === 'first_person' ? 'roaming' : ''}`}
        style={{
          opacity: isLocked && !isOverlayActive && viewMode === 'first_person' ? 0.9 : 0,
          pointerEvents: 'none',
          transform: targetPoi ? 'scale(2.0)' : 'scale(1.0)',
          borderColor: targetPoi ? '#2563eb' : 'rgba(255, 255, 255, 0.85)',
        }}
      />

      {/* Reticle Interaction Prompt */}
      {isLocked && !isOverlayActive && targetPoi && viewMode === 'first_person' && (
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 35,
          }}
        >
          <div
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.74rem',
              color: '#f8fafc',
              fontWeight: 600,
            }}
          >
            [E] Inspect {targetPoi.title}
          </div>
        </div>
      )}

      {/* Minimal Splat Streaming Progress Bar (Visible only when loading < 100%) */}
      {progress < 100 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: isSidebarOpen ? 304 : 16,
            zIndex: 30,
            borderRadius: 8,
            padding: '6px 12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'left 0.2s ease',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
            Streaming 3D Scene
          </span>
          <div
            style={{
              width: 80,
              height: 4,
              background: '#f1f5f9',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#2563eb',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>
            {progress}%
          </span>
        </div>
      )}

      {/* Command Palette Spatial Search Engine Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectPoi={(poi) => {
          setIsPaletteOpen(false);
          setSelectedPoi(poi);
          handleStartNavigation(poi);
        }}
        playerCoords={playerCoords}
        pois={pois}
      />

      {/* Load Custom Local Dataset Modal */}
      <DatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onApplyDataset={handleApplyCustomDataset}
        onResetDefault={handleResetDefaultDataset}
        currentDatasetType={datasetType}
        currentPoiCount={pois.length}
      />

      {/* Stream Remote 3D Scene (Hugging Face / CDN) Modal */}
      <RemoteUrlModal
        isOpen={isRemoteUrlModalOpen}
        onClose={() => setIsRemoteUrlModalOpen(false)}
        onApplyRemoteDataset={handleApplyRemoteUrl}
      />

      {/* User Authentication & SQLite Identity Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* User Profile & Account Switcher Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
        }}
        onOpenAuthModal={() => {
          setIsAuthModalOpen(true);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
      />
    </div>
  );
}
