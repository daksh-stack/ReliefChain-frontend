import '../styles/RequestCard.css';

const RequestCard = ({ request, rank, isHighlighted, showActions, onStatusUpdate }) => {

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
        const labels = {
            'pregnant': 'Pregnant',
            'elderly': 'Elderly',
            'child': 'Child',
            'disabled': 'Disabled',
            'adult': 'Adult'
        };
        return labels[category] || category;
    };

    const getStatusClass = (status) => {
        return status?.toLowerCase().replace('_', '-') || '';
    };

    const getAidTypeIcon = (aidType) => {
        const icons = {
            'life-saving-medicine': '💊',
            'serious-injury': '🩹',
            'regular-medicine': '💉',
            'food-water': '🍲',
            'shelter': '🏠'
        };
        return icons[aidType] || '📦';
    };

    const getVulnerabilityIcon = (category) => {
        const icons = {
            'pregnant': '🤰',
            'elderly': '👴',
            'child': '👶',
            'disabled': '♿',
            'adult': '👤'
        };
        return icons[category] || '👤';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    const getPriorityLevel = (score) => {
        if (score >= 60) return { level: 'critical', label: 'Critical' };
        if (score >= 45) return { level: 'high', label: 'High' };
        if (score >= 30) return { level: 'medium', label: 'Medium' };
        return { level: 'low', label: 'Low' };
    };

    const priority = getPriorityLevel(request.priorityScore);

    return (
        <div className={`request-card ${isHighlighted ? 'highlighted' : ''} ${showActions ? 'with-actions' : ''}`}>
            {rank && (
                <div className={`rank-badge ${rank === 1 ? 'first' : ''}`}>
                    #{rank}
                </div>
            )}

            <div className="card-header">
                <div className="person-info">
                    <span className="person-icon">{getVulnerabilityIcon(request.vulnerabilityCategory)}</span>
                    <div>
                        <h3 className="person-name">{request.name}</h3>
                        <span className="person-category">{getVulnerabilityLabel(request.vulnerabilityCategory)}</span>
                    </div>
                </div>
                <div className={`priority-badge ${priority.level}`}>
                    <span className="priority-score">{request.priorityScore?.toFixed(1)}</span>
                    <span className="priority-label">{priority.label}</span>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="info-icon">📍</span>
                    <span className="info-value">{request.location?.district}</span>
                </div>

                <div className="info-row">
                    <span className="info-icon">{getAidTypeIcon(request.aidType)}</span>
                    <span className="info-value">{getAidTypeLabel(request.aidType)}</span>
                </div>

                <div className="info-row">
                    <span className="info-icon">⏱️</span>
                    <span className="info-value">Waiting: {formatTime(request.createdAt)}</span>
                </div>

                {request.contactPhone && (
                    <div className="info-row">
                        <span className="info-icon">📞</span>
                        <span className="info-value">{request.contactPhone}</span>
                    </div>
                )}
            </div>

            <div className="score-breakdown">
                <div className="score-item">
                    <span className="score-label">Vulnerability</span>
                    <span className="score-value">{request.vulnerabilityScore} × 5</span>
                </div>
                <div className="score-item">
                    <span className="score-label">Urgency</span>
                    <span className="score-value">{request.medicalUrgencyScore} × 10</span>
                </div>
                <div className="score-item">
                    <span className="score-label">Wait Time</span>
                    <span className="score-value">+{(request.priorityScore - (request.vulnerabilityScore * 5) - (request.medicalUrgencyScore * 10)).toFixed(1)}</span>
                </div>
            </div>

            {showActions && (
                <div className="card-actions">
                    <span className={`current-status ${getStatusClass(request.status)}`}>
                        {request.status?.replace('_', ' ')}
                    </span>

                    {request.status === 'IN_TRANSIT' && (
                        <button
                            className="action-btn deliver-btn"
                            onClick={() => onStatusUpdate(request._id, 'DELIVERED')}
                        >
                            ✅ Mark Delivered
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RequestCard;
