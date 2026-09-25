import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, otpAPI } from '../services/api';

// ── Registration Steps ─────────────────────────────────────────────────────
// Step 1: Fill form + enter phone
// Step 2: Enter OTP sent to phone
// Step 3: Account created → redirect to login

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP entry
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Step 1: Validate form and send Email OTP ───────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await otpAPI.send(form.email);
      if (res.data?.otp_code) {
        setOtpCode(res.data.otp_code);
        setSuccess(`OTP sent to ${form.email}. (Testing OTP Code: ${res.data.otp_code})`);
      } else {
        setSuccess(res.data?.message || `OTP sent successfully to ${form.email}. Check your Gmail inbox/spam.`);
      }
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || err.message || 'Failed to send Gmail OTP. Please check email address.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify Gmail OTP and complete registration ─────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      // First verify Email OTP
      await otpAPI.verify(form.email, otpCode);

      // Then register the user
      await authAPI.register({
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        password: form.password,
        password2: form.password2,
      });

      setSuccess('✅ Email Verified & Account Created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([field, errs]) => {
            const label = field.replace('_', ' ');
            const msg = Array.isArray(errs) ? errs.join(' ') : errs;
            return `${label}: ${msg}`;
          })
          .join('\n');
        setError(msgs);
      } else {
        setError(data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await otpAPI.send(form.email);
      setSuccess('New OTP sent! Check the Django terminal.');
    } catch {
      setError('Failed to resend OTP.');
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
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>{step === 1 ? '🌱' : '📧'}</div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#7dd56f',
            margin: '0.5rem 0 0.25rem',
          }}>
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p style={{ color: '#a5d6a7', fontSize: '0.9rem' }}>
            {step === 1
              ? 'Join SmartCrop and protect your harvest'
              : `Enter the 6-digit OTP sent to ${form.email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step >= s ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(255,255,255,0.1)',
                border: step >= s ? 'none' : '1px solid #2d5a27',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '.8rem',
              }}>
                {step > s ? '✓' : s}
              </div>
              <span style={{ color: step >= s ? '#7dd56f' : '#5a7a5a', fontSize: '.8rem', fontWeight: 600 }}>
                {s === 1 ? 'Details' : 'Verify OTP'}
              </span>
              {s < 2 && <div style={{ width: 30, height: 1, background: step > s ? '#4caf50' : '#2d5a27' }} />}
            </div>
          ))}
        </div>

        {/* Error Box */}
        {error && (
          <div style={{
            background: 'rgba(244,67,54,0.12)',
            border: '1px solid #f44336',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#ef9a9a',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success Box */}
        {success && (
          <div style={{
            background: 'rgba(76,175,80,0.12)',
            border: '1px solid #4caf50',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#a5d6a7',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
          }}>
            {success}
          </div>
        )}

        {/* ── STEP 1: Registration Form ─────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

            <div>
              <label style={labelStyle}>Username <span style={{ color: '#f44336' }}>*</span></label>
              <input id="reg-username" name="username" type="text" value={form.username}
                onChange={handleChange} placeholder="e.g. john_farmer" required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>First Name <span style={{ color: '#f44336' }}>*</span></label>
                <input id="reg-firstname" name="first_name" type="text" value={form.first_name}
                  onChange={handleChange} placeholder="First name" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name <span style={{ color: '#f44336' }}>*</span></label>
                <input id="reg-lastname" name="last_name" type="text" value={form.last_name}
                  onChange={handleChange} placeholder="Last name" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>📧 Gmail / Email Address <span style={{ color: '#f44336' }}>*</span></label>
              <input id="reg-email" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="your.name@gmail.com" required style={inputStyle} />
              <p style={{ color: '#81c784', fontSize: '.75rem', margin: '.25rem 0 0', lineHeight: 1.4 }}>
                An OTP verification code will be sent to this email address
              </p>
            </div>

            <div>
              <label style={labelStyle}>📱 Mobile Number <span style={{ color: '#f44336' }}>*</span></label>
              <input id="reg-phone" name="phone" type="tel" value={form.phone}
                onChange={handleChange} placeholder="10-digit mobile number (e.g. 9876543210)"
                required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password <span style={{ color: '#f44336' }}>*</span></label>
              <input id="reg-password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Minimum 8 characters" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password <span style={{ color: '#f44336' }}>*</span></label>
              <input id="reg-password2" name="password2" type="password" value={form.password2}
                onChange={handleChange} placeholder="Repeat your password" required style={inputStyle} />
            </div>

            <button id="reg-send-otp" type="submit" disabled={loading} style={{
              background: loading ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.4rem', boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
            }}>
              {loading ? '⏳ Sending Email OTP…' : '📧 Send Gmail OTP & Continue'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP Entry ─────────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(76,175,80,0.08)', border: '1px solid #2d5a27',
              borderRadius: 12, padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '.25rem' }}>📧</div>
              <p style={{ color: '#a5d6a7', fontSize: '.9rem', margin: 0 }}>
                Verification OTP sent to <strong style={{ color: '#7dd56f' }}>{form.email}</strong>
              </p>
              <p style={{ color: '#81c784', fontSize: '.78rem', margin: '.3rem 0 0' }}>
                Check your Gmail inbox/spam or testing notice above for your 6-digit OTP code
              </p>
            </div>

            <div>
              <label style={labelStyle}>Enter 6-digit OTP <span style={{ color: '#f44336' }}>*</span></label>
              <input
                id="otp-input"
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
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
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

            <button id="reg-verify-otp" type="submit" disabled={loading} style={{
              background: loading ? '#3a5a3a' : 'linear-gradient(135deg, #4caf50, #2e7d32)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
            }}>
              {loading ? '⏳ Verifying & Creating Account…' : '✅ Verify OTP & Create Account'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} style={{
                background: 'none', color: '#81c784', border: 'none', cursor: 'pointer',
                fontSize: '.85rem', textDecoration: 'underline',
              }}>
                ← Edit Details
              </button>
              <button type="button" onClick={handleResendOTP} disabled={loading} style={{
                background: 'none', color: '#7dd56f', border: 'none', cursor: 'pointer',
                fontSize: '.85rem', textDecoration: 'underline',
              }}>
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#a5d6a7', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#7dd56f', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  color: '#a5d6a7',
  fontSize: '0.83rem',
  fontWeight: 600,
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid #2d5a27',
  borderRadius: '8px',
  padding: '0.7rem 1rem',
  color: '#e8f5e9',
  fontSize: '0.93rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
