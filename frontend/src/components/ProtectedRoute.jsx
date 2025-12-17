import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is super admin
    if (!authService.isSuperAdmin()) {
      // Redirect to super admin login
      navigate('/admin/super-admin-login');
    }
  }, [navigate]);

  // If super admin, render the protected content
  if (authService.isSuperAdmin()) {
    return children;
  }

  // While checking/redirecting, show nothing
  return null;
};

export default ProtectedRoute;
