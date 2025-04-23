// src/hooks/useProtectedRoute.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useProtectedRoute = (requiredRole = null) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not logged in, redirect to login
        navigate('/login', { state: { from: location.pathname } });
      } else if (requiredRole && user.role !== requiredRole) {
        // User doesn't have the required role
        navigate('/dashboard', { 
          state: { 
            error: `Access denied. You need ${requiredRole} privileges.` 
          } 
        });
      }
    }
  }, [user, loading, navigate, location.pathname, requiredRole]);

  return { user, loading };
};

// Usage example:
// const AdminDashboard = () => {
//   const { user, loading } = useProtectedRoute('admin');
//
//   if (loading) return <LoadingSpinner />;
//   return <div>Admin Dashboard Content</div>;
// };