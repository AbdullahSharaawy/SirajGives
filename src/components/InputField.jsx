// src/components/InputField.jsx
import React from 'react';

const InputField = ({ icon: Icon, type = 'text', placeholder, register, error }) => {
  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '0.5rem' }}>
      {/* Render the icon if one is passed */}
      {Icon && (
        <Icon style={{ position: 'absolute', right: '10px', top: '12px', color: '#999' }} />
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        className="custom-input"
        {...register} // Spread the react-hook-form props here
        style={{
          width: '100%',
          padding: Icon ? '10px 35px 10px 10px' : '10px',
          borderRadius: '5px',
          border: error ? '1px solid red' : '1px solid #ccc',
          outline: 'none',
          backgroundColor: 'white'
        }}
      />
      
      {/* Display validation error message if it exists */}
      {error && (
        <span style={{ color: 'red', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;