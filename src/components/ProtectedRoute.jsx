// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, isSuperAdmin, isOrgAdmin, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        جاري التحميل...
      </div>
    );
  }

  // 1. If not authenticated, send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. If the route specifically requires superadmin, and the user isn't one
  if (role === 'superadmin' && !isSuperAdmin) {
    return <Navigate to={isOrgAdmin ? "/org-admin" : "/"} replace />;
  }

  // 3. 
  if (role === 'orgadmin' && !isOrgAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  
  // 4. If all checks pass (or if no specific role is required, like for /profile), render the route
  return children;
};

export default ProtectedRoute;