import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/VictimForm.css';

const VictimForm = () => {
    const [config, setConfig] = useState({
        vulnerabilityCategories: [],
        aidTypes: []
    });
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        address: '',
        aidType: '',
        vulnerabilityCategory: '',
        description: '',
        contactPhone: ''
    });
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadConfig();
        // Pre-fill name and phone from user
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                contactPhone: user.phone || ''
            }));
        }
    }, [user]);

    const loadConfig = async () => {
        try {
            const response = await requestAPI.getConfig();
            setConfig(response.data.data);
        } catch (error) {
            console.error('Failed to load config:', error);
            toast.error('Failed to load form options');
        } finally {
            setConfigLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.district || !formData.aidType || !formData.vulnerabilityCategory) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const requestData = {
                name: formData.name,
                location: {
                    district: formData.district,
                    address: formData.address || ''
                },
                aidType: formData.aidType,
                vulnerabilityCategory: formData.vulnerabilityCategory,
                description: formData.description,
                contactPhone: formData.contactPhone
            };

            const response = await requestAPI.submit(requestData);

            toast.success('Relief request submitted successfully!');
            toast.success(`Queue position: ${response.data.data.queuePosition}`, {
                duration: 5000
            });

            // Reset form
            setFormData({
                name: user?.name || '',
                district: '',
                address: '',
                aidType: '',
                vulnerabilityCategory: '',
                description: '',
                contactPhone: user?.phone || ''
            });

            // Navigate to status tracker
            navigate('/status');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit request. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (configLoading) {
        return (
            <div className="victim-form-container">
                <div className="loading-spinner">Loading form...</div>
            </div>
        );
    }

    return (
        <div className="victim-form-container">
            <div className="form-card">
                <div className="form-header">
                    <h1>🆘 Request Relief Aid</h1>
                    <p>Fill in your details to request emergency assistance</p>
                </div>

                <form onSubmit={handleSubmit} className="relief-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>

                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactPhone">Contact Phone</label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Location Details</h3>

                        <div className="form-group">
                            <label htmlFor="district">District *</label>
                            <input
                                type="text"
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="Enter your district"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Full Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your complete address"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Aid Request Details</h3>

                        <div className="form-group">
                            <label htmlFor="vulnerabilityCategory">Vulnerability Category *</label>
                            <select
                                id="vulnerabilityCategory"
                                name="vulnerabilityCategory"
                                value={formData.vulnerabilityCategory}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                {config.vulnerabilityCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label} (Priority Score: {cat.score})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="aidType">Type of Aid Required *</label>
                            <select
                                id="aidType"
                                name="aidType"
                                value={formData.aidType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select aid type</option>
                                {config.aidTypes.map(aid => (
                                    <option key={aid.value} value={aid.value}>
                                        {aid.label} (Urgency Score: {aid.score})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Additional Details</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide any additional information about your situation"
                                rows={3}
                                maxLength={500}
                            />
                            <span className="char-count">{formData.description.length}/500</span>
                        </div>
                    </div>

                    <div className="priority-info">
                        <h4>ℹ️ Priority Calculation</h4>
                        <p>Your request will be prioritized based on:</p>
                        <ul>
                            <li><strong>Vulnerability Score:</strong> Based on your category</li>
                            <li><strong>Medical Urgency:</strong> Based on aid type</li>
                            <li><strong>Waiting Time:</strong> Priority increases over time</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Submitting Request...' : '🚀 Submit Relief Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VictimForm;
