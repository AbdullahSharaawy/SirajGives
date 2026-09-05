// src/components/ProtectedRoute.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, login } = useContext(AuthContext);
  
  // Hooks to read and manipulate the URL
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Local state to pause the redirect if we spot a token in the URL
  const [processingToken, setProcessingToken] = useState(!!searchParams.get('token'));

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Log the user in immediately via Context
      login(token);
      
      // 2. Erase the token from the browser's address bar for security
      // 'replace: true' prevents the user from hitting the "Back" button and seeing the token again
      navigate(location.pathname, { replace: true }); 
    }
    
    // Release the pause state
    setProcessingToken(false);
  }, [searchParams, login, navigate, location.pathname]);

  // Show loading screen if Context is initializing OR if we are processing a URL token
  if (loading || processingToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        جاري التحميل...
      </div>
    );
  }

  // If there's no active session (and no token was found in the URL), boot them to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected page (like Dashboard)
  return children;
};

export default ProtectedRoute;