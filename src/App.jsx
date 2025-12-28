import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VictimForm from './pages/VictimForm';
import VolunteerDashboard from './pages/VolunteerDashboard';
import StatusTracker from './pages/StatusTracker';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'volunteer' || user?.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/request" replace />;
  }

  return children;
};

// Home Page Component
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <div className="hero-badge">24/7 Emergency Response</div>
          <h1 className="hero-title">
            <span className="title-accent">ReliefChain</span>
          </h1>
          <p className="hero-subtitle">
            Swift. Smart. Life-Saving.
          </p>
          <p className="hero-description">
            Connect with disaster relief volunteers instantly.
            Get food, medicine, and shelter when you need it most.
          </p>

          <div className="hero-actions">
            {isAuthenticated() ? (
              <>
                {(user?.role === 'victim' || user?.role === 'admin') && (
                  <Link to="/request" className="btn btn-emergency pulse">
                    <span className="btn-icon">🆘</span>
                    Request Emergency Aid
                  </Link>
                )}
                {(user?.role === 'volunteer' || user?.role === 'admin') && (
                  <Link to="/dashboard" className="btn btn-primary">
                    <span className="btn-icon">📋</span>
                    Volunteer Dashboard
                  </Link>
                )}
                <Link to="/status" className="btn btn-outline">
                  Track My Request
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-emergency pulse">
                  <span className="btn-icon">🆘</span>
                  Get Help Now
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Become a Volunteer
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-visual fade-in-delayed">
          <div className="visual-circle"></div>
          <div className="visual-ring"></div>
          <span className="visual-icon">🚑</span>
        </div>
      </section>

      {/* Emergency Helplines Section */}
      <section className="helplines-section slide-up">
        <h2 className="section-title">Emergency Helplines</h2>
        <p className="section-subtitle">Immediate assistance available 24/7</p>

        <div className="helplines-grid">
          <a href="tel:112" className="helpline-card">
            <div className="helpline-icon">📞</div>
            <div className="helpline-info">
              <span className="helpline-number">112</span>
              <span className="helpline-name">National Emergency</span>
            </div>
          </a>

          <a href="tel:1078" className="helpline-card">
            <div className="helpline-icon">🚨</div>
            <div className="helpline-info">
              <span className="helpline-number">1078</span>
              <span className="helpline-name">Disaster Management (NDMA)</span>
            </div>
          </a>

          <a href="tel:108" className="helpline-card">
            <div className="helpline-icon">🚑</div>
            <div className="helpline-info">
              <span className="helpline-number">108</span>
              <span className="helpline-name">Ambulance Services</span>
            </div>
          </a>

          <a href="tel:101" className="helpline-card">
            <div className="helpline-icon">🔥</div>
            <div className="helpline-info">
              <span className="helpline-number">101</span>
              <span className="helpline-name">Fire Emergency</span>
            </div>
          </a>

          <a href="tel:1070" className="helpline-card">
            <div className="helpline-icon">🌊</div>
            <div className="helpline-info">
              <span className="helpline-number">1070</span>
              <span className="helpline-name">Flood Control Room</span>
            </div>
          </a>

          <a href="tel:181" className="helpline-card">
            <div className="helpline-icon">👩</div>
            <div className="helpline-info">
              <span className="helpline-number">181</span>
              <span className="helpline-name">Women Helpline</span>
            </div>
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section slide-up">
        <h2 className="section-title">How It Works</h2>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Submit Request</h3>
            <p>Describe your emergency and location</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Prioritized</h3>
            <p>Critical cases are served first</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Receive Aid</h3>
            <p>Volunteer delivers relief to you</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>ReliefChain © 2024 — Connecting help when it matters most</p>
      </footer>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/request"
              element={
                <ProtectedRoute allowedRoles={['victim', 'admin']}>
                  <VictimForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/status"
              element={
                <ProtectedRoute>
                  <StatusTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
