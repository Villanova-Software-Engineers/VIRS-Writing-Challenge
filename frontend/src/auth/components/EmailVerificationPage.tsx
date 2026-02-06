import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import '../styles/auth.css';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const firebaseUser = AuthService.getCurrentFirebaseUser();
    if (firebaseUser) {
      setUserEmail(firebaseUser.email || '');
    } else {
      navigate('/auth/sign-up');
    }
  }, [navigate]);

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage('');

    try {
      const verified = await AuthService.checkEmailVerification();

      if (verified) {
        setIsVerified(true);
        setMessage('Email verified successfully! Redirecting to sign in...');

        setTimeout(async () => {
          await AuthService.signOut();
          navigate('/auth/sign-in');
        }, 1800);
      } else {
        setMessage('Not verified yet. Click the link in your inbox, then try again.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to check verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await AuthService.resendVerificationEmail();
      setMessage(response.message);
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = async () => {
    await AuthService.signOut();
    navigate('/auth/sign-in');
  };

  return (
    <div className="auth-panel" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-eyebrow">Email verification</div>
          <h2 className="auth-title">{isVerified ? 'All set!' : 'Check your inbox'}</h2>
          <p className="auth-subtitle">
            {isVerified
              ? 'Your email is verified. Continue to sign in.'
              : `We sent a link to ${userEmail || 'your email address'}. Click it, then confirm below.`}
          </p>
        </div>

        {message && (
          <div className={`alert ${isVerified || message.includes('sent') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!isVerified ? (
          <div className="auth-form">
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="primary-btn"
              type="button"
            >
              {isChecking ? 'Checking…' : "I've verified my email"}
            </button>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="secondary-btn"
              type="button"
            >
              {isResending ? 'Sending…' : 'Resend verification email'}
            </button>
            <button
              onClick={handleBackToSignIn}
              type="button"
              className="link-btn"
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <button
            onClick={handleBackToSignIn}
            className="primary-btn"
            type="button"
          >
            Go to sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
