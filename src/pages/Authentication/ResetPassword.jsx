import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';
import LogoImage from '../../assets/logo.jpeg';
import './ResetPassword.css';

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .required('كلمة المرور مطلوبة')
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      'يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'كلمتا المرور غير متطابقتين')
    .required('تأكيد كلمة المرور مطلوب'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (!token || !email) {
      setApiError('رابط غير صالح. يرجى طلب رابط جديد.');
    }
  }, [token, email]);

  useEffect(() => {
    // Update password strength indicators
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    });
  }, [password]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await api.post('/User/reset-password', {
        email: email,
        token: token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const result = response.data;

      if (!result.success) {
        setApiError(result.message || 'فشل إعادة تعيين كلمة المرور.');
        return;
      }

      // Navigate to success page
      navigate('/verify-email?success=true', {
        state: {
          message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        'حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordStrengthCheck = ({ condition, label }) => (
    <div className="strength-check">
      {condition ? (
        <FiCheck className="strength-icon success" />
      ) : (
        <FiX className="strength-icon fail" />
      )}
      <span className={condition ? 'success' : 'fail'}>{label}</span>
    </div>
  );

  return (
    <AuthLayout imageSrc={LogoImage}>
      <div className="reset-password-wrapper" dir="rtl">
        <div className="reset-password-header">
          <h1 className="reset-password-title">إنشاء كلمة مرور جديدة</h1>
          <p className="reset-password-subtitle">
            أدخل كلمة مرور قوية وآمنة لحمايتك
          </p>
        </div>

        {apiError && <div className="error-message">{apiError}</div>}

        {!apiError && (
          <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
            <div className="password-input-wrapper">
              <InputField
                icon={FiLock}
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور الجديدة"
                register={register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="تبديل عرض كلمة المرور"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password Strength Requirements */}
            <div className="password-requirements">
              <h3>متطلبات كلمة المرور:</h3>
              <PasswordStrengthCheck
                condition={passwordStrength.hasMinLength}
                label="8 أحرف على الأقل"
              />
              <PasswordStrengthCheck
                condition={passwordStrength.hasUpperCase}
                label="حرف كبير واحد على الأقل"
              />
              <PasswordStrengthCheck
                condition={passwordStrength.hasLowerCase}
                label="حرف صغير واحد على الأقل"
              />
              <PasswordStrengthCheck
                condition={passwordStrength.hasNumber}
                label="رقم واحد على الأقل"
              />
              <PasswordStrengthCheck
                condition={passwordStrength.hasSpecialChar}
                label="رمز خاص واحد على الأقل (@$!%*?&)"
              />
            </div>

            <div className="password-input-wrapper">
              <InputField
                icon={FiLock}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="تأكيد كلمة المرور"
                register={register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="تبديل عرض تأكيد كلمة المرور"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={
                !passwordStrength.hasMinLength ||
                !passwordStrength.hasUpperCase ||
                !passwordStrength.hasLowerCase ||
                !passwordStrength.hasNumber ||
                !passwordStrength.hasSpecialChar
              }
            >
              تعيين كلمة المرور الجديدة
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
