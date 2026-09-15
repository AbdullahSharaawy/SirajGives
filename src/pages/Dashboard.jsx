// src/pages/Dashboard.jsx
import { useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

const Dashboard = () => {
  const { login, logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if there is a token in the URL (coming from Google Login)
    const urlToken = searchParams.get('token');

    if (urlToken) {
      // 2. Save the token and authenticate the user
      login(urlToken);
      
      // 3. Clean up the URL so the token doesn't stay visible in the address bar
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h2 style={{ color: '#569b59', marginBottom: '1rem' }}>لوحة التحكم</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        مرحباً بك! لقد قمت بتسجيل الدخول بنجاح.
      </p>
      
      <div style={{ maxWidth: '300px', margin: '0 auto' }}>
        <Button onClick={logout} style={{ backgroundColor: '#d9534f' }}>
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;