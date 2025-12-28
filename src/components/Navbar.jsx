import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout, isVolunteer, isAdmin, isVictim } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    if (!isAuthenticated()) {
        return (
            <nav className="navbar">
                <div className="nav-brand">
                    <Link to="/">
                        <span className="brand-icon">🚨</span>
                        <span className="brand-text">ReliefChain</span>
                    </Link>
                </div>
                <div className="nav-links">
                    <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                        Login
                    </Link>
                    <Link to="/register" className="nav-link btn-primary">
                        Register
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">
                    <span className="brand-icon">🚨</span>
                    <span className="brand-text">Disaster Relief</span>
                </Link>
            </div>

            <div className="nav-links">
                {(isVictim() || isAdmin()) && (
                    <Link
                        to="/request"
                        className={`nav-link ${isActive('/request') ? 'active' : ''}`}
                    >
                        🆘 Request Aid
                    </Link>
                )}

                {(isVictim() || isAdmin()) && (
                    <Link
                        to="/status"
                        className={`nav-link ${isActive('/status') ? 'active' : ''}`}
                    >
                        📍 My Requests
                    </Link>
                )}

                {(isVolunteer() || isAdmin()) && (
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        📋 Dashboard
                    </Link>
                )}

                <div className="nav-user">
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
