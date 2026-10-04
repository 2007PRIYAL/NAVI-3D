import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { loginUser, registerUser, fetchDbStats } from '../services/authApi';
import { playArrivalChime, playUiClick, playWarningBuzz } from '../utils/audio';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setError('');
      setSuccess('');
      fetchDbStats().then(setDbStats).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    playUiClick();
    try {
      const user = await loginUser(demoEmail, demoPass);
      setSuccess(`Authenticated as ${user.name} (${user.role})`);
      playArrivalChime();
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed');
      playWarningBuzz();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    playUiClick();

    try {
      if (tab === 'login') {
        const user = await loginUser(email, password);
        setSuccess(`Welcome back, ${user.name}!`);
        playArrivalChime();
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 700);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        const user = await registerUser({ email, password, name, role });
        setSuccess(`Account registered in SQLite database for ${user.name}!`);
        playArrivalChime();
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 700);
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
      playWarningBuzz();
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: 460,
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
        {/* Header with Title and Close Button */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(192, 38, 211, 0.3)',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
                {tab === 'login' ? 'Sign In to NAVI-3D' : 'Create Account'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                Neural Accessibility & Vision-guided Indoor 3D Navigator
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Database Status Chip */}
        <div
          style={{
            padding: '10px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontWeight: 600 }}>
            <Database size={13} color="#7C3AED" />
            <span>SQLite Database:</span>
            <span style={{ color: '#047857', fontWeight: 700 }}>● Online (data/navi3d_users.db)</span>
          </div>
          <span style={{ color: '#64748b', fontWeight: 500 }}>
            {dbStats?.userCount || 3} registered accounts
          </span>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 12,
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                background: tab === 'login' ? '#ffffff' : 'transparent',
                color: tab === 'login' ? '#0f172a' : '#64748b',
                fontWeight: tab === 'login' ? 700 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: tab === 'login' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                background: tab === 'register' ? '#ffffff' : 'transparent',
                color: tab === 'register' ? '#0f172a' : '#64748b',
                fontWeight: tab === 'register' ? 700 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: tab === 'register' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* 1-Click Fast Demo Accounts (when on login tab) */}
        {tab === 'login' && (
          <div style={{ padding: '14px 24px 4px 24px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Quick Demo Logins (Click to Sign In):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('amil@aegis.edu', 'password123')}
                style={{
                  padding: '7px 8px',
                  borderRadius: 9,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e40af' }}>Amil Bhatt</div>
                <div style={{ fontSize: '0.62rem', color: '#3b82f6', fontWeight: 500 }}>Student</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@aegis.edu', 'director123')}
                style={{
                  padding: '7px 8px',
                  borderRadius: 9,
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46' }}>Dr. Sarah</div>
                <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 500 }}>Director</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('marcus@aegis.edu', 'secure123')}
                style={{
                  padding: '7px 8px',
                  borderRadius: 9,
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#92400e' }}>Marcus V.</div>
                <div style={{ fontSize: '0.62rem', color: '#d97706', fontWeight: 500 }}>Safety Lead</div>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.8rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Role / Designation
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.8rem',
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty Member">Faculty Member</option>
                  <option value="Facility Director">Facility Director</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Visitor">Visitor</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@navi3d.internal"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 36px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 10,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 18px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 35%, #F43F5E 70%, #FB923C 100%)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(192, 38, 211, 0.35)',
              transition: 'all 0.12s ease',
            }}
          >
            {loading ? (
              <span>Connecting to SQLite DB...</span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
