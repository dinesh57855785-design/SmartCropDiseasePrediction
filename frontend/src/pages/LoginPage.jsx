import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { otpAPI } from '../services/api';

export default function LoginPage() {
  const { login, loginWithOTP } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  
  // Password state
  const [form, setForm] = useState({ username: '', password: '' });
  
  // Email OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter email & send, 2 = enter OTP & verify
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Password Login Handler ──────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Email OTP Step 1: Send OTP ────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = otpEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await otpAPI.send(cleanEmail);
      if (res.data?.otp_code) {
        setOtpCode(res.data.otp_code);
        setSuccess(`OTP sent to ${cleanEmail}. (Testing OTP Code: ${res.data.otp_code})`);
      } else {
        setSuccess(res.data?.message || `OTP sent to ${cleanEmail}. Check your Gmail inbox/spam.`);
      }
      setOtpStep(2);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to send Gmail OTP. Please check email address.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── Email OTP Step 2: Verify & Sign In ─────────────────────────────────────────
  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await loginWithOTP(otpEmail, otpCode);
      setSuccess('✅ Gmail OTP Verified! Redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1f0d 0%, #1a2e1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(29, 52, 29, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #2d5a27',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🌿</div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#7dd56f',
            margin: '0.5rem 0 0.25rem',
          }}>Welcome Back</h1>
          <p style={{ color: '#a5d6a7', fontSize: '0.9rem' }}>Sign in to your SmartCrop account</p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              background: authMode === 'password' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔑 Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setError(''); setSuccess(''); setOtpStep(1); }}
            style={{
              flex: 1,
              background: authMode === 'otp' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📧 Gmail OTP
          </button>
        </div>

        {/* Error Box */}
        {error && (
          <div style={{
            background: 'rgba(244,67,54,0.15)',
            border: '1px solid #f44336',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ef9a9a',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success Box */}
        {success && (
          <div style={{
            background: 'rgba(76,175,80,0.15)',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#a5d6a7',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
          }}>
            {success}
          </div>
        )}

        {/* ── MODE 1: Password Login ────────────────────────────────────────── */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input
                id="login-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={inputStyle}
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
              }}
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        )}

        {/* ── MODE 2: Gmail OTP Login ───────────────────────────────────────── */}
        {authMode === 'otp' && (
          <>
            {otpStep === 1 && (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>📧 Registered Gmail / Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="Enter your registered email (e.g. dinesh@gmail.com)"
                    required
                    style={inputStyle}
                  />
                </div>
                <button
                  id="login-send-otp"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                  }}
                >
                  {loading ? '⏳ Sending Email OTP...' : '📧 Send Gmail OTP'}
                </button>
              </form>
            )}

            {otpStep === 2 && (
              <form onSubmit={handleOTPLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Enter 6-Digit Gmail OTP Code</label>
                  <input
                    id="login-otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    required
                    style={{
                      ...inputStyle,
                      fontSize: '1.4rem',
                      textAlign: 'center',
                      letterSpacing: '0.4rem',
                      fontWeight: 700,
                    }}
                  />
                </div>
                <div style={{
                  background: 'rgba(76,175,80,0.1)',
                  border: '1px dashed #4caf50',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#a5d6a7',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  lineHeight: 1.4,
                }}>
                  <span>ℹ️</span>
                  <span><strong>Demo Mode:</strong> Use code <strong>123456</strong> to bypass.</span>
                </div>
                <button
                  id="login-verify-otp"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                  }}
                >
                  {loading ? '⏳ Verifying...' : '✅ Verify Email OTP & Sign In'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(1); setError(''); setSuccess(''); }}
                    style={{ background: 'none', color: '#81c784', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                  >
                    ← Change Email Address
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    style={{ background: 'none', color: '#7dd56f', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                  >
                    Resend Email OTP
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#a5d6a7', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7dd56f', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  color: '#a5d6a7',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.4rem',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid #2d5a27',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#e8f5e9',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};
