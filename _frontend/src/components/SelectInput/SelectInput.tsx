import React, { useId } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  options?: SelectOption[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  editorProps?: {
    options?: SelectOption[];
    [key: string]: any;
  };
}

const SelectInput = React.memo(({
  value,
  onChange,
  label,
  options = [],
  className = '',
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  name,
  editorProps = {},
}: SelectInputProps) => {
  const id = useId();
  const selectOptions = editorProps?.options || options;
  const hasOptions = selectOptions.length > 0;
  
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name || label?.toLowerCase().replace(/\s+/g, '-')}
        className={`w-full text-foreground bg-background px-3 py-2  border rounded-md shadow-sm focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !hasOptions}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
      >
        <option value="" style={{color: 'var(--foreground)', backgroundColor: 'var(--background)'}} disabled>{placeholder}</option>
        {hasOptions ? 
          selectOptions.map((option) => (
            <option style={{color: 'var(--foreground)', backgroundColor: 'var(--background)'}} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        : 
          <option value="" disabled>No options available</option>
        }
      </select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';

export default SelectInput;
