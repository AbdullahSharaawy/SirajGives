// src/components/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  isLoading = false, 
  disabled = false, 
  onClick,
  style = {} // Allow overriding styles if needed in specific edge cases
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      style={{
        backgroundColor: '#569b59', // The primary green from your design
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '5px',
        cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
        fontWeight: 'bolder',
        width: '100%',
        marginTop: '1rem',
        opacity: (isLoading || disabled) ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out',
        ...style // Merge any custom styles passed as props
      }}
    >
      {isLoading ? 'جاري التحميل...' : children}
    </button>
  );
};

export default Button;