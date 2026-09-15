// src/components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { Navigate, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, isSuperAdmin, isOrgAdmin, loading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const urlToken = searchParams.get('token');

  useEffect(() => {
    if (urlToken) {
      login(urlToken);
      navigate(location.pathname, { replace: true }); 
    }
  }, [urlToken, login, navigate, location.pathname]);

  if (loading || urlToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        جاري التحميل...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role === "superadmin" && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (role === "orgadmin" && !isOrgAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;