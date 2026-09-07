import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiMail, FiRefreshCw } from 'react-icons/fi';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';
import config from '../../config';
import LogoImage from '../../assets/logo.jpeg';
import './VerifyEmail.css';

const VerifyEmail = ({ verified = false }) => {
	const location = useLocation();
	const [isResent, setIsResent] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const email = location.state?.email || 'بريدك الإلكتروني';
    const queryParams = new URLSearchParams(location.search);
	
	const isSuccessUrl = queryParams.get('success') === 'true';
	const isActuallyVerified = isSuccessUrl || verified;
	const handleResend = async () => {
		// Prevent calling the API if there is no valid email
		if (!email || email === 'بريدك الإلكتروني') return;

		setIsLoading(true);
		setError(null);
		setIsResent(false);

		try {
			const response = await api.post('/User/resend-confirmation', {
				email: email,
				returnUrl: `${config.baseUrl}/verify-email`
			});
			console.log(response);
			setIsResent(true);
		} catch (err) {
			// Axios encapsulates the response inside err.response
			const errorMessage = 
				err.response?.data?.message || 
				err.response?.data || 
				'حدث خطأ أثناء إعادة إرسال البريد.';
			
			setError(typeof errorMessage === 'string' ? errorMessage : 'حدث خطأ أثناء إعادة إرسال البريد.');
		} finally {
			setIsLoading(false);
		}
	};

	if (isActuallyVerified) {
		return (
			<AuthLayout imageSrc={LogoImage}>
				<div className="verification-page" dir="rtl">
					
					<div className="verification-icon verification-icon--success" aria-hidden="true">
						<FiCheck />
					</div>
					<h1>تم تفعيل حسابك بنجاح</h1>
					<p>يمكنك الآن تسجيل الدخول والاستفادة من جميع خدمات منصة سراج.</p>
					<Link className="verification-primary-action" to="/login">تسجيل الدخول</Link>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout imageSrc={LogoImage}>
			<div className="verification-page" dir="rtl">
				
				<div className="verification-icon verification-icon--mail" aria-hidden="true">
					<FiMail />
					<span><FiCheck /></span>
				</div>
				<h1>تحقق من بريدك الإلكتروني</h1>
				<p>لقد أرسلنا رسالة تحتوي على رابط لتفعيل حسابك إلى:</p>
				<strong className="verification-email">{email}</strong>
				{location.state?.message && <div className="verification-note">{location.state.message}</div>}
				
				<button
					type="button"
					className="verification-primary-action verification-button"
					onClick={handleResend}
					disabled={isLoading}
				>
					{isLoading ? 'جاري الإرسال...' : 'إعادة إرسال البريد'} <FiRefreshCw className={isLoading ? 'spinning' : ''} />
				</button>

				{isResent && <p className="verification-resend-message">تم طلب إعادة إرسال الرسالة بنجاح.</p>}
				{error && <p className="verification-error-message" style={{ color: 'red' }}>{error}</p>}
				
				<Link className="verification-secondary-action" to="/login">
					العودة لتسجيل الدخول <FiArrowLeft />
				</Link>
			</div>
		</AuthLayout>
	);
};

export default VerifyEmail;