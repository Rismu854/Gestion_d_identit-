import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/api';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppId, setCurrentAppId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isEditing) {
        await applicationService.update(currentAppId, formData);
      } else {
        await applicationService.create(formData);
      }
      
      resetForm();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      setError('Failed to save application');
    }
  };

  const handleEdit = (app) => {
    setFormData({
      name: app.name,
      description: app.description,
      owner: app.owner
    });
    setIsEditing(true);
    setCurrentAppId(app.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationService.delete(id);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      owner: ''
    });
    setIsEditing(false);
    setCurrentAppId(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="application-list">
      <div className="app-list-header">
        <h2>Applications</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {showForm && (
        <div className="application-form">
          <h3>{isEditing ? 'Edit Application' : 'Add New Application'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Application Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {isEditing ? 'Update' : 'Create'} Application
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="application-grid">
          {applications.map(app => (
            <div key={app.id} className="application-card">
              <h3>{app.name}</h3>
              <p className="app-description">{app.description}</p>
              <p className="app-owner">Owner: {app.owner_name}</p>
              <div className="card-actions">
                <button onClick={() => handleEdit(app)} className="btn-secondary">Edit</button>
                <button onClick={() => handleDelete(app.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;