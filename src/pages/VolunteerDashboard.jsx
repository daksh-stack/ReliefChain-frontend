import { useState, useEffect, useCallback } from 'react';
import { requestAPI } from '../services/api';
import {
    connectSocket,
    onQueueUpdated,
    onNewRequest,
    onRequestDequeued,
    onHighPriorityAlert,
    onQueueState
} from '../services/socket';
import {
    initDB,
    cacheRequests,
    getCachedRequests,
    addPendingUpdate,
    syncPendingUpdates,
    isOnline,
    registerNetworkListeners
} from '../services/offline';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

const VolunteerDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dequeuing, setDequeuing] = useState(false);
    const [online, setOnline] = useState(navigator.onLine);
    const [activeTab, setActiveTab] = useState('queue');
    const [assignedRequests, setAssignedRequests] = useState([]);
    const { user } = useAuth();

    // Initialize offline support
    useEffect(() => {
        initDB();
    }, []);

    // Load queue data
    const loadQueue = useCallback(async () => {
        try {
            if (isOnline()) {
                const response = await requestAPI.getQueue();
                const queueData = response.data.data.queue || [];
                setQueue(queueData);
                // Cache for offline use
                await cacheRequests(queueData);
            } else {
                // Load from cache
                const cached = await getCachedRequests();
                setQueue(cached);
                toast('Showing cached data (offline)', { icon: '📴' });
            }
        } catch (error) {
            console.error('Failed to load queue:', error);
            // Try loading from cache
            const cached = await getCachedRequests();
            if (cached.length > 0) {
                setQueue(cached);
                toast('Loaded from cache', { icon: '💾' });
            } else {
                toast.error('Failed to load queue');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Load assigned requests
    const loadAssignedRequests = useCallback(async () => {
        if (!isOnline()) return;

        try {
            const response = await requestAPI.getAssignedRequests();
            setAssignedRequests(response.data.data.requests || []);
        } catch (error) {
            console.error('Failed to load assigned requests:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadQueue();
        loadAssignedRequests();
    }, [loadQueue, loadAssignedRequests]);

    // Setup Socket.io
    useEffect(() => {
        connectSocket();

        const unsubQueueState = onQueueState((data) => {
            setQueue(data.queue);
            cacheRequests(data.queue);
        });

        const unsubQueueUpdated = onQueueUpdated((data) => {
            setQueue(data.queue);
            cacheRequests(data.queue);
        });

        const unsubNewRequest = onNewRequest((data) => {
            toast.success(`New request: ${data.request.name}`, { icon: '📩' });
            loadQueue();
        });

        const unsubDequeued = onRequestDequeued((data) => {
            toast(`Request assigned to ${data.assignedTo}`, { icon: '✅' });
            loadQueue();
            loadAssignedRequests();
        });

        const unsubHighPriority = onHighPriorityAlert((data) => {
            toast(data.message, {
                icon: '🚨',
                duration: 6000,
                style: {
                    background: '#ff4444',
                    color: '#fff'
                }
            });
        });

        return () => {
            unsubQueueState();
            unsubQueueUpdated();
            unsubNewRequest();
            unsubDequeued();
            unsubHighPriority();
        };
    }, [loadQueue, loadAssignedRequests]);

    // Network status handling
    useEffect(() => {
        const handleOnline = async () => {
            setOnline(true);
            toast.success('Back online!');

            // Sync pending updates
            const { synced, failed } = await syncPendingUpdates(
                (id, status) => requestAPI.updateStatus(id, status)
            );

            if (synced > 0) {
                toast.success(`Synced ${synced} pending updates`);
            }
            if (failed > 0) {
                toast.error(`Failed to sync ${failed} updates`);
            }

            loadQueue();
            loadAssignedRequests();
        };

        const handleOffline = () => {
            setOnline(false);
            toast('You are offline. Changes will be synced when online.', { icon: '📴' });
        };

        return registerNetworkListeners(handleOnline, handleOffline);
    }, [loadQueue, loadAssignedRequests]);

    // Dequeue highest priority
    const handleDequeue = async () => {
        if (!isOnline()) {
            toast.error('Cannot dequeue while offline');
            return;
        }

        setDequeuing(true);
        try {
            const response = await requestAPI.dequeue();
            const request = response.data.data.request;

            toast.success(`Assigned: ${request.name} - ${request.aidType}`);
            loadQueue();
            loadAssignedRequests();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to dequeue';
            toast.error(message);
        } finally {
            setDequeuing(false);
        }
    };

    // Update status
    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            if (isOnline()) {
                await requestAPI.updateStatus(requestId, newStatus);
                toast.success(`Status updated to ${newStatus}`);
                loadAssignedRequests();
            } else {
                // Save for later sync
                await addPendingUpdate({ requestId, status: newStatus });
                toast('Status saved locally. Will sync when online.', { icon: '💾' });

                // Update local state optimistically
                setAssignedRequests(prev =>
                    prev.map(req =>
                        req._id === requestId ? { ...req, status: newStatus } : req
                    )
                );
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1>🚑 Volunteer Dashboard</h1>
                    <p>Welcome, {user?.name}</p>
                </div>
                <div className="header-status">
                    <span className={`status-indicator ${online ? 'online' : 'offline'}`}>
                        {online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('queue')}
                >
                    📋 Priority Queue ({queue.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assigned')}
                >
                    📦 My Assigned ({assignedRequests.length})
                </button>
            </div>

            {activeTab === 'queue' && (
                <div className="queue-section">
                    <div className="queue-actions">
                        <button
                            className="dequeue-btn"
                            onClick={handleDequeue}
                            disabled={dequeuing || queue.length === 0 || !online}
                        >
                            {dequeuing ? 'Processing...' : '⬆️ Take Highest Priority'}
                        </button>
                        <button
                            className="refresh-btn"
                            onClick={loadQueue}
                            disabled={loading}
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading queue...</div>
                    ) : queue.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">✅</span>
                            <p>No pending requests in the queue!</p>
                        </div>
                    ) : (
                        <div className="queue-list">
                            {queue.map((request, index) => (
                                <RequestCard
                                    key={request._id}
                                    request={request}
                                    rank={index + 1}
                                    isHighlighted={index === 0}
                                    showActions={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'assigned' && (
                <div className="assigned-section">
                    {assignedRequests.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <p>No assigned requests yet. Dequeue from the priority queue to get started!</p>
                        </div>
                    ) : (
                        <div className="assigned-list">
                            {assignedRequests.map(request => (
                                <RequestCard
                                    key={request._id}
                                    request={request}
                                    showActions={true}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VolunteerDashboard;
