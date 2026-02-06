import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-panel" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-eyebrow">Heads up</div>
          <h2 className="auth-title">Sign-in is on deck</h2>
          <p className="auth-subtitle">
            We’re wiring the dashboard flow next. For now, create your account and verify your email
            so you’re first in line when the challenge opens.
          </p>
        </div>
        <button className="primary-btn" type="button" onClick={() => navigate('/auth/sign-up')}>
          Back to sign up
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
