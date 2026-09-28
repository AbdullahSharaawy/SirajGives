import './AuthLayout.css';

const AuthLayout = ({ children, imageSrc, quote, quoteSubtext }) => {
  return (
    <div className="auth-container">
      {/* Because your HTML will have dir="rtl", 
        this first element will render on the RIGHT side. 
      */}
      <div className="auth-form-section">
        <div className="auth-form-content">
          {/* The specific page form (Login, Signup, etc.) will be injected here */}
          {children}
        </div>
      </div>

     
    </div>
  );
};

export default AuthLayout;