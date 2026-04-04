import React, { useState } from 'react';
import { apiUrl } from '../../lib/api';

const AdminForgotPassword = ({ onBack }) => {
  const [identity, setIdentity] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('request');

  const parseApiResponse = async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { error: text || `Unexpected response from server (${response.status})` };
    }
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/password-reset-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity }),
      });

      const result = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(result.error || `Failed to request password reset (${response.status}).`);
      }

      setMessage(result.message || 'Password reset instructions sent.');
      if (result.token) {
        setResetToken(result.token);
        setStep('reset');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/password-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });

      const result = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(result.error || `Failed to reset password (${response.status}).`);
      }

      setMessage(result.message || 'Password updated successfully.');
      setStep('done');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-master-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <section className="login-card-pro" style={{ width: '100%', maxWidth: '420px', background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', zIndex: 1, border: '1px solid #f1f5f9' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>Forgot Password</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Reset your admin password using your username or email.</p>
        </div>

        {step === 'request' && (
          <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Username or Email</label>
            <input
              type="text"
              className="input-modern"
              style={{ width: '100%' }}
              placeholder="Enter username or email"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              required
            />
            {error && <div className="error-badge-pro" style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>{error}</div>}
            {message && <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', color: '#047857', fontSize: '13px', fontWeight: 700 }}>{message}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px' }}>Request Reset</button>
            <button type="button" className="btn-secondary" style={{ width: '100%', height: '48px', fontSize: '15px' }} onClick={onBack}>Back to Login</button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Enter the reset token you received, then choose a new password.
            </div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Reset Token</label>
            <input
              type="text"
              className="input-modern"
              style={{ width: '100%' }}
              placeholder="Paste your reset token here"
              value={resetToken}
              onChange={(event) => setResetToken(event.target.value)}
              required
            />
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>New Password</label>
            <input
              type="password"
              className="input-modern"
              style={{ width: '100%' }}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            {error && <div className="error-badge-pro" style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>{error}</div>}
            {message && <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', color: '#047857', fontSize: '13px', fontWeight: 700 }}>{message}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px' }}>Reset Password</button>
            <button type="button" className="btn-secondary" style={{ width: '100%', height: '48px', fontSize: '15px' }} onClick={onBack}>Back to Login</button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '16px', color: '#047857', fontWeight: 700 }}>{message || 'Password updated successfully.'}</div>
            <button type="button" className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px' }} onClick={onBack}>Return to Login</button>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminForgotPassword;
