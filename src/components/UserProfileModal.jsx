import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Clock,
  Database,
  LogOut,
  UserPlus,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { fetchAllUsers, fetchDbStats, logoutUser } from '../services/authApi';
import { playArrivalChime, playUiClick } from '../utils/audio';

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onOpenAuthModal,
  onLogout,
}) {
  const [users, setUsers] = useState([]);
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      fetchAllUsers().then(setUsers).catch(() => {});
      fetchDbStats().then(setDbStats).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onMouseEnter={() => {
        if (document.pointerLockElement) document.exitPointerLock?.();
      }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.18s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px 14px 22px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
              }}
            >
              {currentUser?.avatar || 'AB'}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.01em' }}>
                {currentUser?.name || 'Amil Bhatt'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {currentUser?.role || 'Student'} • {currentUser?.email || 'amil@navi3d.internal'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Database Telemetry Badge */}
        <div
          style={{
            padding: '10px 22px',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontWeight: 600 }}>
            <Database size={13} color="#2563eb" />
            <span>SQLite Database Engine:</span>
            <span style={{ color: '#047857', fontWeight: 700 }}>● Active</span>
          </div>
          <span style={{ color: '#64748b', fontWeight: 600 }}>
            {dbStats?.fileSizeKb ? `${dbStats.fileSizeKb} KB` : '28 KB'}
          </span>
        </div>

        {/* User Accounts from Database */}
        <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Switch Account (Registered in SQLite):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {users.map((u) => {
              const isSelected = currentUser?.email === u.email;
              return (
                <div
                  key={u.id || u.email}
                  onClick={() => {
                    playUiClick();
                    onSwitchUser(u);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isSelected ? '#2563eb' : '#cbd5e1',
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {u.avatar || u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                        {u.role} • {u.email}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={16} color="#2563eb" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Register new user / Log out */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            <UserPlus size={14} color="#2563eb" />
            <span>Sign In / Register</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              logoutUser();
              onLogout();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
