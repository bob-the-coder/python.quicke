import React, { useState, KeyboardEvent, ChangeEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  formData?: any; // Support for form context
  disabled?: boolean;
  editorProps?: {
    allowDuplicates?: boolean;
    maxTags?: number;
    delimiter?: string;
    [key: string]: any;
  };
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  label,
  className = '',
  placeholder = 'Add tag and press Enter',
  disabled = false,
  editorProps = {},
}) => {
  const [inputValue, setInputValue] = useState('');
  const { 
    allowDuplicates = false,
    maxTags = 0,
    delimiter = 'Enter'
  } = editorProps;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === delimiter && inputValue.trim()) {
      addTag(inputValue.trim());
      setInputValue('');
    }
  };

  const addTag = (tag: string) => {
    if (disabled) return;
    if (!allowDuplicates && value.includes(tag)) return;
    if (maxTags > 0 && value.length >= maxTags) return;
    
    onChange([...value, tag]);
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-col gap-1 w-full shrink ${className}`}>
      {label && <label className="text-sm font-medium leading-none color-alternate">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyDown}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-gray-500 hover:text-red-500 font-medium"
                aria-label="Remove tag"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
