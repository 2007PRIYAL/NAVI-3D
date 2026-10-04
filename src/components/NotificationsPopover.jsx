import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Volume2,
  VolumeX,
  X,
  Check,
} from 'lucide-react';
import { playUiClick } from '../utils/audio';

export default function NotificationsPopover({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  isMuted = false,
  onToggleMute,
}) {
  if (!isOpen) return null;

  return (
    <div
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 68,
        right: 240,
        width: 360,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        zIndex: 50,
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Popover Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="#7C3AED" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E1B4B' }}>
            Building Alerts & Notices
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => {
              playUiClick();
              onMarkAllRead?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#7C3AED',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 6,
            }}
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 2,
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f8fafc',
              display: 'flex',
              gap: 12,
              background: item.read ? '#ffffff' : '#f8fafc',
              transition: 'background 0.12s ease',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: item.type === 'alert' ? '#fef2f2' : item.type === 'access' ? '#ecfdf5' : '#eff6ff',
                color: item.type === 'alert' ? '#ef4444' : item.type === 'access' ? '#10b981' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {item.type === 'alert' ? (
                <AlertTriangle size={15} />
              ) : item.type === 'access' ? (
                <CheckCircle2 size={15} />
              ) : (
                <Info size={15} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 500 }}>
                  {item.time}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2, lineHeight: 1.35 }}>
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Toggle Footer */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          Audio Chimes & Cues
        </span>
        <button
          onClick={() => {
            playUiClick();
            onToggleMute?.();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isMuted ? (
            <>
              <VolumeX size={13} color="#ef4444" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 size={13} color="#10b981" />
              <span>Enabled</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
