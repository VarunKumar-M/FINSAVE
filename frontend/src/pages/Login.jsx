import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh', background: '#0f1117', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    card: {
      width: '360px', background: '#1a1d27', border: '1px solid #2d3148',
      borderRadius: '16px', padding: '36px',
    },
    logo: { fontSize: '22px', fontWeight: '700', color: '#6366f1', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#64748b', marginBottom: '28px' },
    label: { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' },
    input: {
      width: '100%', padding: '10px 12px', background: '#0f1117', border: '1px solid #2d3148',
      borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px', outline: 'none',
    },
    btn: {
      width: '100%', padding: '11px', background: loading ? '#4b4fbd' : '#6366f1',
      border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px',
      fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
    },
    error: {
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px', padding: '10px 14px', color: '#fca5a5',
      fontSize: '13px', marginBottom: '16px',
    },
    footer: { marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#475569' },
    link: { color: '#6366f1', textDecoration: 'none', fontWeight: '500' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>💰 FinSave</div>
        <div style={s.subtitle}>Sign in to your account</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Username</label>
          <input style={s.input} type="text" placeholder="your username"
            value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={s.footer}>
          Don't have an account? <Link to="/register" style={s.link}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
