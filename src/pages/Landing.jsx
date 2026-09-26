import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Radar, CheckCircle,
  Brain, Camera, Bell, ShieldCheck, MapPin, Activity,
  Users, CheckSquare, Clock
} from 'lucide-react';
import Button from '../components/Common/Button';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            Lost Something on Campus?<br />
            We'll Help You Find It.
          </h1>
          <p className="landing-subtitle">
            NIET's smart Lost & Found portal uses AI-powered matching to reunite students with their belongings. Report it. Match it. Claim it.
          </p>
          <div className="landing-cta-buttons">
            <Button size="lg" variant="primary" onClick={() => navigate('/report-lost')}>
              Report Lost Item
            </Button>
            <Button size="lg" variant="primary" onClick={() => navigate('/report-found')}>
              I Found Something
            </Button>
          </div>

          <div className="landing-stats">
            <div className="stat-card">
              <CheckSquare className="stat-icon" size={24} />
              <span>500+ Items Returned</span>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" size={24} />
              <span>2000+ Students</span>
            </div>
            <div className="stat-card">
              <Activity className="stat-icon" size={24} />
              <span>95% Match Rate</span>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" size={24} />
              <span>&lt; 24hr Avg Recovery</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Three simple steps to recover your belongings</p>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <FileText size={32} />
            </div>
            <h3 className="step-title">1. Report</h3>
            <p className="step-desc">Submit details and photo of your lost or found item</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrapper">
              <Radar size={32} />
            </div>
            <h3 className="step-title">2. AI Matches</h3>
            <p className="step-desc">Our smart algorithm finds potential matches instantly</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrapper">
              <CheckCircle size={32} />
            </div>
            <h3 className="step-title">3. Recover</h3>
            <p className="step-desc">Verify ownership and collect from security office</p>
          </div>
        </div>
      </section>


      {/* CTA Banner */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">Ready to find your lost items?</h2>
        <Button size="lg" onClick={() => navigate('/register')} style={{ backgroundColor: 'var(--color-accent)', color: 'white', border: 'none' }}>
          Get Started Now
        </Button>
        <Link to="/login" className="landing-cta-link">Already have an account? Log in</Link>
      </section>
    </div>
  );
}
