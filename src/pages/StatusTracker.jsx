import { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import { connectSocket, onStatusUpdated } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/StatusTracker.css';

const StatusTracker = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadRequests = async () => {
        try {
            const response = await requestAPI.getMyRequests();
            setRequests(response.data.data.requests || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
            toast.error('Failed to load your requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Real-time status updates
    useEffect(() => {
        connectSocket();

        const unsubStatusUpdated = onStatusUpdated((data) => {
            setRequests(prev =>
                prev.map(req =>
                    req._id === data.requestId
                        ? { ...req, status: data.newStatus }
                        : req
                )
            );

            if (data.newStatus === 'DELIVERED') {
                toast.success('Your request has been delivered! 🎉');
            } else if (data.newStatus === 'IN_TRANSIT') {
                toast.success('A volunteer is on the way! 🚗');
            }
        });

        return () => {
            unsubStatusUpdated();
        };
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return '⏳';
            case 'IN_TRANSIT':
                return '🚗';
            case 'DELIVERED':
                return '✅';
            default:
                return '❓';
        }
    };

    const getStatusClass = (status) => {
        return status.toLowerCase().replace('_', '-');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAidTypeLabel = (aidType) => {
        const labels = {
            'life-saving-medicine': 'Life-saving Medicine',
            'serious-injury': 'Serious Injury',
            'regular-medicine': 'Regular Medicine',
            'food-water': 'Food / Water',
            'shelter': 'Shelter'
        };
        return labels[aidType] || aidType;
    };

    const getVulnerabilityLabel = (category) => {
        return category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
    };

    return (
        <div className="status-tracker-container">
            <div className="tracker-header">
                <h1>📍 My Relief Requests</h1>
                <p>Track the status of your submitted requests</p>
            </div>

            <div className="status-legend">
                <div className="legend-item">
                    <span className="status-badge pending">⏳ Pending</span>
                    <p>In queue, waiting for volunteer</p>
                </div>
                <div className="legend-item">
                    <span className="status-badge in-transit">🚗 In Transit</span>
                    <p>Volunteer assigned, on the way</p>
                </div>
                <div className="legend-item">
                    <span className="status-badge delivered">✅ Delivered</span>
                    <p>Aid successfully delivered</p>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading your requests...</div>
            ) : requests.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <h3>No requests yet</h3>
                    <p>You haven't submitted any relief requests.</p>
                    <a href="/request" className="submit-link">Submit a Request</a>
                </div>
            ) : (
                <div className="requests-list">
                    {requests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <div className="request-title">
                                    <h3>{request.name}</h3>
                                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                                        {getStatusIcon(request.status)} {request.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="request-date">
                                    Submitted: {formatDate(request.createdAt)}
                                </div>
                            </div>

                            <div className="request-details">
                                <div className="detail-row">
                                    <span className="label">📍 Location:</span>
                                    <span className="value">{request.location?.district}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">🏥 Aid Type:</span>
                                    <span className="value">{getAidTypeLabel(request.aidType)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">👤 Category:</span>
                                    <span className="value">{getVulnerabilityLabel(request.vulnerabilityCategory)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">📊 Priority Score:</span>
                                    <span className="value priority-score">{request.priorityScore?.toFixed(2)}</span>
                                </div>
                            </div>

                            {request.assignedTo && (
                                <div className="assigned-info">
                                    <span className="label">🙋 Assigned Volunteer:</span>
                                    <span className="value">{request.assignedTo.name}</span>
                                </div>
                            )}

                            {request.status === 'DELIVERED' && request.deliveredAt && (
                                <div className="delivered-info">
                                    <span className="label">📦 Delivered on:</span>
                                    <span className="value">{formatDate(request.deliveredAt)}</span>
                                </div>
                            )}

                            {request.description && (
                                <div className="request-description">
                                    <span className="label">📝 Notes:</span>
                                    <p>{request.description}</p>
                                </div>
                            )}

                            <div className="progress-bar">
                                <div className={`progress-step ${request.status !== 'PENDING' ? 'completed' : 'active'}`}>
                                    <div className="step-icon">1</div>
                                    <div className="step-label">Submitted</div>
                                </div>
                                <div className="progress-line"></div>
                                <div className={`progress-step ${request.status === 'IN_TRANSIT' ? 'active' : request.status === 'DELIVERED' ? 'completed' : ''}`}>
                                    <div className="step-icon">2</div>
                                    <div className="step-label">In Transit</div>
                                </div>
                                <div className="progress-line"></div>
                                <div className={`progress-step ${request.status === 'DELIVERED' ? 'completed' : ''}`}>
                                    <div className="step-icon">3</div>
                                    <div className="step-label">Delivered</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="refresh-btn" onClick={loadRequests}>
                🔄 Refresh Status
            </button>
        </div>
    );
};

export default StatusTracker;
