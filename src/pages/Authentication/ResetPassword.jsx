import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
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
      'يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'كلمتا المرور غير متطابقتين')
    .required('تأكيد كلمة المرور مطلوب'),
});

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

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token') || searchParams.get('encodedToken');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });

  const passwordStrength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    
  };

  const invalidLink = !token || !email;
  const displayError = invalidLink
    ? 'رابط غير صالح. يرجى طلب رابط جديد.'
    : apiError;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await api.post('/User/reset-password', {
        email: email,
        token: token,
        encodedToken: token,
        password: data.password,
        confirmPassword: data.confirmPassword,
        newPassword: data.password,
      }, { skipAuthRedirect: true });

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

  return (
    <AuthLayout imageSrc={LogoImage}>
      <div className="reset-password-wrapper" dir="rtl">
        <div className="reset-password-header">
          <h1 className="reset-password-title">إنشاء كلمة مرور جديدة</h1>
          <p className="reset-password-subtitle">
            أدخل كلمة مرور قوية وآمنة لحمايتك
          </p>
        </div>

        {displayError && <div className="error-message">{displayError}</div>}

        {!invalidLink && (
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
                !passwordStrength.hasNumber 
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
