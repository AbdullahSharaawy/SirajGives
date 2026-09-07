import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';
import config from '../../config';
import LogoImage from '../../assets/logo.jpeg';
import './ForgotPassword.css';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('يرجى إدخال بريد إلكتروني صحيح')
    .required('البريد الإلكتروني مطلوب'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/User/forgot-password', {
        email: data.email,
        returnUrl: `${config.baseUrl}/reset-password`,
      });

      const result = response.data;

      if (!result.success) {
        setApiError(result.message || 'فشل إرسال طلب استعادة كلمة المرور.');
        return;
      }

      setSuccessMessage(
        'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك والنقر على الرابط لإعادة تعيين كلمة المرور.'
      );
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc={LogoImage}>
      <div className="forgot-password-wrapper" dir="rtl">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">نسيت كلمة المرور؟</h1>
          <p className="forgot-password-subtitle">
            لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {apiError && <div className="error-message">{apiError}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
          <InputField
            icon={FiMail}
            type="email"
            placeholder="البريد الإلكتروني"
            register={register('email')}
            error={errors.email?.message}
          />

          <Button type="submit" isLoading={isLoading}>
            إرسال رابط الاستعادة
          </Button>
        </form>

        <Link className="forgot-password-back-link" to="/login">
          <FiArrowRight /> العودة لتسجيل الدخول
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
