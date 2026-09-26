import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  className = '',
  options = [],
  ...rest
}) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <div className="input-icon-wrapper">{icon}</div>}
        
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`input-field textarea ${icon ? 'has-icon' : ''} ${error ? 'input-error-state' : ''}`}
            {...rest}
          />
        ) : isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`input-field select ${icon ? 'has-icon' : ''} ${error ? 'input-error-state' : ''}`}
            {...rest}
          >
            <option value="" disabled>
              {placeholder || 'Select an option'}
            </option>
            {options.map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`input-field ${icon ? 'has-icon' : ''} ${error ? 'input-error-state' : ''}`}
            {...rest}
          />
        )}
      </div>

      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

export default Input;
