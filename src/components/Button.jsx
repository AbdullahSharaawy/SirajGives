// src/components/Button.jsx
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  isLoading = false, 
  disabled = false, 
  onClick,
  style = {},
  variant = 'primary',
  size = 'md',
  full = true,
  className = '',
  ...props
}) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={classNames}
      style={style}
    >
      {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
      {isLoading ? 'جاري التحميل...' : children}
    </button>
  );
};

export default Button;