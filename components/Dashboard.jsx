// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { accessRequestService, applicationService, userAccessService } from '../services/api';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsResponse, accessesResponse] = await Promise.all([
          accessRequestService.getAll(),
          userAccessService.getAll()
        ]);
        
        setRequests(requestsResponse.data);
        setAccesses(accessesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await accessRequestService.approve(id);
      // Refresh requests after approval
      const response = await accessRequestService.getAll();
      setRequests(response.data);
      // Refresh accesses since a new one might have been created
      const accessResponse = await userAccessService.getAll();
      setAccesses(accessResponse.data);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await accessRequestService.reject(id);
      // Refresh requests after rejection
      const response = await accessRequestService.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await userAccessService.revoke(id);
      // Refresh accesses after revocation
      const response = await userAccessService.getAll();
      setAccesses(response.data);
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <section className="dashboard-section">
        <h3>Access Requests</h3>
        {requests.length === 0 ? (
          <p>No access requests found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.application_name}</td>
                  <td>{request.requester_name}</td>
                  <td>{request.status}</td>
                  <td>{new Date(request.request_date).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(request.id)} className="btn-success">Approve</button>
                        <button onClick={() => handleReject(request.id)} className="btn-danger">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
      <section className="dashboard-section">
        <h3>My Access</h3>
        {accesses.length === 0 ? (
          <p>You don't have access to any applications yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Granted Date</th>
                <th>Granted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accesses.map(access => (
                <tr key={access.id}>
                  <td>{access.application_name}</td>
                  <td>{new Date(access.granted_date).toLocaleDateString()}</td>
                  <td>{access.granted_by_name}</td>
                  <td>
                    <button onClick={() => handleRevoke(access.id)} className="btn-danger">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
