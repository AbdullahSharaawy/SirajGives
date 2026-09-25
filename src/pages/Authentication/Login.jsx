// src/pages/Login.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiUser, FiLock } from 'react-icons/fi'; 
import { FcGoogle } from 'react-icons/fc';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import LogoImage from '../../assets/logo.jpeg';
import './Login.css'; 
import config from '../../config';
const schema = yup.object().shape({
  identifier: yup
    .string()
    .required('البريد الإلكتروني أو اسم المستخدم مطلوب'),
  password: yup
    .string()
    .required('كلمة المرور مطلوبة'),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const { login, isAuthenticated, isOrgAdmin, isSuperAdmin, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');
  const [apiMessage, setApiMessage] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (isOrgAdmin && !isSuperAdmin) {
        const redirectTo = (location.state?.from?.pathname && location.state.from.pathname !== '/')
          ? location.state.from.pathname
          : '/org-admin';
        navigate(redirectTo, { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      }
    }
  }, [loading, isAuthenticated, isOrgAdmin, isSuperAdmin, navigate, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    setApiMessage('');
    setUnconfirmedEmail('');

    try {
      const response = await api.post('/User/login', {
        userName: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe,
      }, { skipAuthRedirect: true });
      const result = response.data;
      if (result.success === false) {
        setApiError(result.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
        return;
      }

      const token = typeof result.data === 'string'
        ? result.data
        : result.data?.token ?? result.data?.accessToken;
      if (!token) {
        setApiError(result.message || 'تعذر تسجيل الدخول. لم يتم استلام رمز المصادقة.');
        return;
      }

      const authInfo = await login(token);
      if (authInfo?.isOrgAdmin && !authInfo?.isSuperAdmin) {
        const redirectTo = (location.state?.from?.pathname && location.state.from.pathname !== '/')
          ? location.state.from.pathname
          : '/org-admin';
        navigate(redirectTo, { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (
        msg.toLowerCase().includes('confirm your email') ||
        msg.includes('تأكيد') ||
        error.response?.status === 401 && msg.toLowerCase().includes('email')
      ) {
        setApiError('يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.');
        if (data.identifier.includes('@')) {
          setUnconfirmedEmail(data.identifier);
        }
      } else {
        setApiError(
          error.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const loginUrl = new URL(`${config.backendUrl}/api/ExternalLogin/external-login`);
    loginUrl.searchParams.append('provider', 'Google');
    loginUrl.searchParams.append('returnUrl', `${window.location.origin}/`);
    window.location.href = loginUrl.toString();
  };

  return (
    <AuthLayout imageSrc={LogoImage}>
      <div className="login-wrapper">
        <div className="login-header">
          <h2 className="login-title">مرحباً بعودتك</h2>
          <p className="login-subtitle">سجل دخولك للوصول إلى حسابك.</p>
        </div>

        {apiError && (
          <div className="error-message">
            {apiError}
            {unconfirmedEmail && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                <Link
                  to="/verify-email"
                  state={{ email: unconfirmedEmail }}
                  style={{ color: '#2b772b', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  إعادة إرسال رابط تأكيد البريد الإلكتروني
                </Link>
              </div>
            )}
          </div>
        )}

        {apiMessage && (
          <div className="success-message">
            {apiMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <InputField
            icon={FiUser}
            type="text"
            placeholder="البريد الإلكتروني أو اسم المستخدم"
            register={register('identifier')}
            error={errors.identifier?.message}
          />

          <InputField
            icon={FiLock}
            type="password"
            placeholder="كلمة المرور"
            register={register('password')}
            error={errors.password?.message}
          />

          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                {...register('rememberMe')} 
                className="custom-checkbox"
              />
              تذكرني
            </label>
            <Link to="/forgot-password" className="forgot-password">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>
            تسجيل الدخول
          </Button>
        </form>

        <div className="divider-container">
          <span>أو</span>
        </div>
        
        <div className="social-login-container">
          <button type="button" className="social-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} />
          </button>
        </div>

        <div className="signup-container">
          <span className="signup-text">ليس لديك حساب؟</span>
          <Link to="/signup" className="signup-link">
            إنشاء حساب
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;