import React from 'react';
import SignUpForm from '../components/SignUpForm';
import '../styles/auth.css';

const SignUpPage: React.FC = () => {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span>✍️ VIRS Writing Challenge</span>
            <span style={{ color: '#a2c5ff' }}>Villanova · Spring 2026</span>
          </div>

          <h1 className="hero-title">
            Villanova Writing Tracker for faculty & post-docs.
          </h1>
          <p className="hero-subtitle">
            Run a trust-based writing challenge with time tracking, streaks, and a shared semester message board.
            Built for small cohorts (~50), simple admin control, and transparent progress.
          </p>

          <div className="hero-grid">
            <div className="hero-card">
              <div className="label">Semester focus</div>
              <div className="value">Spring 2026 · 14 weeks</div>
              <div className="hero-pills">
                <span className="hero-pill">Single board</span>
                <span className="hero-pill">Admin oversight</span>
              </div>
            </div>
            <div className="hero-card">
              <div className="label">Cohort size</div>
              <div className="value">Up to 50 writers</div>
              <div className="hero-pills">
                <span className="hero-pill">Faculty</span>
                <span className="hero-pill">Post-docs</span>
              </div>
            </div>
            <div className="hero-card">
              <div className="label">Accountability</div>
              <div className="value">Streaks + timers</div>
              <div className="hero-pills">
                <span className="hero-pill">Start/Stop timer</span>
                <span className="hero-pill">Leaderboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
          <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">
              One profile for challenges, feedback, and publishing tools.
            </p>
          </div>

          <SignUpForm />
        </div>
      </section>
    </div>
  );
};

export default SignUpPage;
