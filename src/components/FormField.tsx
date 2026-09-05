import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'number';
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  as?: 'input';
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  as: 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  as: 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}

export type FormFieldProps =
  | InputFormFieldProps
  | SelectFormFieldProps
  | TextareaFormFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { id, label, required = false, error, helperText, className = '' } = props;

  const inputBaseClasses = `
    w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-800 text-sm
    placeholder:text-slate-400 focus:outline-none transition-all duration-150
    ${
      error
        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
        : 'border-slate-300 hover:border-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20'
    }
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
          {label}
          {required && (
            <span className="text-rose-500 ml-1 font-bold" title="Required field">
              *
            </span>
          )}
        </label>
        {required ? (
          <span className="text-[11px] font-medium text-slate-400">Required</span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Optional</span>
        )}
      </div>

      {props.as === 'textarea' ? (
        <textarea
          id={id}
          rows={props.rows || 3}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`${inputBaseClasses} resize-y min-h-[78px]`}
        />
      ) : props.as === 'select' ? (
        <div className="relative">
          <select
            id={id}
            value={props.value}
            onChange={props.onChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`${inputBaseClasses} appearance-none pr-10 cursor-pointer bg-none`}
          >
            <option value="" disabled>
              {props.placeholder || 'Select an option...'}
            </option>
            {props.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      ) : (
        <input
          id={id}
          type={props.type || 'text'}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={inputBaseClasses}
        />
      )}

      {error ? (
        <div id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-slate-500 pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
