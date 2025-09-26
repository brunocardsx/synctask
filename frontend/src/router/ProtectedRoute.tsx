import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const authToken = localStorage.getItem('authToken');

  console.log('ProtectedRoute: authToken =', authToken);

  if (!authToken) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;