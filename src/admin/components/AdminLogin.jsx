import React from 'react';

const AdminLogin = ({ error, username, setUsername, password, setPassword, handleLogin, onForgotPassword }) => {
  return (
    <main
      className="login-master-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0) 70%)', top: '-10%', left: '-10%', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0) 70%)', bottom: '-10%', right: '-10%', zIndex: 0 }} />

      <section
        className="login-card-pro"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          padding: '48px',
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
          zIndex: 1,
          border: '1px solid #f1f5f9',
        }}
      >
        <div className="login-header" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: '#4f46e5', borderRadius: '12px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
            <i className="fas fa-newspaper" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
            Admin Login
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Login to access the admin panel.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: 8 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-user" style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8', fontSize: '14px' }} />
              <input
                type="text"
                className="input-modern"
                style={{ paddingLeft: '44px', width: '100%' }}
                placeholder="Enter username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Password</label>
              <button
                type="button"
                onClick={onForgotPassword}
                style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8', fontSize: '14px' }} />
              <input
                type="password"
                className="input-modern"
                style={{ paddingLeft: '44px', width: '100%' }}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          {error ? (
            <div className="error-badge-pro" style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #fee2e2' }}>
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          ) : null}

          <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px', marginTop: 10 }}>
            Login
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
