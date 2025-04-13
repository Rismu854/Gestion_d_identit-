// src/components/RequestAccess.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService, accessRequestService } from '../services/api';

const RequestAccess = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationService.getAll();
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedApp) {
      setError('Please select an application');
      return;
    }
    
    try {
      await accessRequestService.create({
        application: selectedApp,
        justification
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting access request:', error);
      setError('Failed to submit request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="request-access">
      <h2>Request Application Access</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="application">Select Application</label>
          <select
            id="application"
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            required
          >
            <option value="">-- Select an application --</option>
            {applications.map(app => (
              <option key={app.id} value={app.id}>{app.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="justification">Justification</label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows="4"
            required
            placeholder="Explain why you need access to this application"
          ></textarea>
        </div>
        
        <button type="submit" className="btn-primary">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestAccess;