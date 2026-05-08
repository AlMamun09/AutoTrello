import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from '@/lib/icons';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: string[] | Option[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function CustomSelect({ value, options, onChange, label, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedOptions: Option[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value) || formattedOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`at-custom-select-container ${className}`} ref={containerRef}>
      {label && <label className="at-label">{label}</label>}
      <div 
        className={`at-custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="at-custom-select-value">{selectedOption?.label}</span>
        <ChevronDown size={14} color={isOpen ? "var(--at-primary)" : "var(--at-text-subtle)"} />
      </div>

      {isOpen && (
        <div className="at-custom-select-options">
          {formattedOptions.map((option) => (
            <div
              key={option.value}
              className={`at-custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {option.value === value && (
                <div className="at-custom-select-check">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
