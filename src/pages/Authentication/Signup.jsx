import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
	FiEye,
	FiEyeOff,
	FiMail,
	FiMapPin,
	FiPhone,
	FiUser,
} from 'react-icons/fi';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';
import config from '../../config';
import PlantHandsImage from '../../assets/logo.jpeg';
import './Signup.css';

const schema = yup.object().shape({
	fullName: yup.string().required('الاسم بالكامل مطلوب'),
	username: yup.string().required('اسم المستخدم مطلوب'),
	email: yup.string().email('يرجى إدخال بريد إلكتروني صحيح').required('البريد الإلكتروني مطلوب'),
	phoneNumber: yup.string().required('رقم الهاتف مطلوب'),
	address: yup.string().required('العنوان مطلوب'),
	password: yup.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').required('كلمة المرور مطلوبة'),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref('password')], 'كلمتا المرور غير متطابقتين')
		.required('تأكيد كلمة المرور مطلوب'),
});

const Signup = () => {
	const navigate = useNavigate();
	const [apiError, setApiError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: yupResolver(schema) });

	const onSubmit = async (data) => {
		setIsLoading(true);
		setApiError('');

		try {
			const result = await api.post('/User/register', {
				fullName: data.fullName,
				username: data.username,
				email: data.email,
				phoneNumber: data.phoneNumber,
				address: data.address,
				password: data.password,
				confirmPassword: data.confirmPassword,
				returnUrl: `${config.baseUrl}/verify-email`
			});
			console.log(result);
			const success = result.data.success ;
			const message = result.data.data || result.data.message;
        
			if (success === false) {
				setApiError(message || 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.');
				return;
			}

			navigate('/verify-email', { state: { email: data.email, message } });
		} catch (error) {
			setApiError(error.response?.data?.message || 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthLayout imageSrc={PlantHandsImage}>
			<div className="signup-wrapper">
				<div className="signup-header">
					<h1 className="signup-title">انضم إلى عائلة سراج</h1>
					<p className="signup-subtitle">ساهم في نشر الخير وكن جزءًا من حملات التبرع على سراج</p>
				</div>

				{apiError && <div className="error-message">{apiError}</div>}

				<form onSubmit={handleSubmit(onSubmit)} className="signup-form">
					<InputField icon={FiUser} placeholder="الاسم بالكامل" register={register('fullName')} error={errors.fullName?.message} />
					<InputField icon={FiUser} placeholder="اسم المستخدم" register={register('username')} error={errors.username?.message} />
					<InputField icon={FiMail} type="email" placeholder="البريد الإلكتروني" register={register('email')} error={errors.email?.message} />
					<InputField icon={FiPhone} type="tel" placeholder="رقم الهاتف" register={register('phoneNumber')} error={errors.phoneNumber?.message} />
					<InputField icon={FiMapPin} placeholder="العنوان" register={register('address')} error={errors.address?.message} />
					<div className="password-field">
						<InputField
							icon={showPassword ? FiEye : FiEyeOff}
							type={showPassword ? 'text' : 'password'}
							placeholder="كلمة المرور"
							register={register('password')}
							error={errors.password?.message}
						/>
						<button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label="إظهار كلمة المرور">
							{showPassword ? <FiEyeOff /> : <FiEye />}
						</button>
					</div>
					<div className="password-field">
						<InputField
							icon={showConfirmPassword ? FiEye : FiEyeOff}
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="تأكيد كلمة المرور"
							register={register('confirmPassword')}
							error={errors.confirmPassword?.message}
						/>
						<button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label="إظهار تأكيد كلمة المرور">
							{showConfirmPassword ? <FiEyeOff /> : <FiEye />}
						</button>
					</div>

					<div className="signup-links">
						<Link to="/login">لدي حساب بالفعل</Link>
						<Link to="/forgot-password">نسيت كلمة المرور؟</Link>
					</div>

					<Button type="submit" isLoading={isLoading}>إنشاء حساب</Button>
				</form>

				<p className="login-prompt">
					لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
				</p>
			</div>
		</AuthLayout>
	);
};

export default Signup;
