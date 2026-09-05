import React from 'react';
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

      {/* This element will render on the LEFT side */}
      <div 
        className="auth-image-section"
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        {/* Optional overlay to make text more readable if needed */}
        <div className="auth-image-overlay">
          {quote && (
            <div className="auth-quote-box">
              <p className="auth-quote-text">{quote}</p>
              {quoteSubtext && <span className="auth-quote-subtext">{quoteSubtext}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;