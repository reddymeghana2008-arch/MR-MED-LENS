import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  maxLength?: number;
  icon?: React.ReactNode;
  showCount?: boolean;
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
  const {
    id,
    label,
    required = false,
    error,
    helperText,
    className = '',
    maxLength,
    icon,
    showCount,
  } = props;

  const currentLength = typeof props.value === 'string' ? props.value.length : 0;

  const inputBaseClasses = `
    w-full py-2.5 bg-white border rounded-xl text-slate-800 text-sm
    placeholder:text-slate-400 focus:outline-none transition-all duration-150 shadow-2xs
    ${icon ? 'pl-10 pr-3.5' : 'px-3.5'}
    ${
      error
        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20'
        : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
    }
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs sm:text-sm font-semibold text-slate-800">
          {label}
          {required && (
            <span className="text-rose-500 ml-1 font-bold" title="Required field">
              *
            </span>
          )}
        </label>
      </div>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            {icon}
          </div>
        )}

        {props.as === 'textarea' ? (
          <div className="relative">
            {icon && (
              <div className="pointer-events-none absolute top-3 left-3 text-slate-400">
                {icon}
              </div>
            )}
            <textarea
              id={id}
              rows={props.rows || 3}
              value={props.value}
              onChange={props.onChange}
              placeholder={props.placeholder}
              maxLength={maxLength}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
              className={`${inputBaseClasses} ${icon ? 'pl-9.5 pt-2.5' : 'p-3'} ${
                showCount ? 'pb-7' : ''
              } resize-y min-h-[82px]`}
            />
            {showCount && maxLength && (
              <div className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-400 pointer-events-none select-none">
                {currentLength}/{maxLength}
              </div>
            )}
          </div>
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
                {props.placeholder || 'Select sex...'}
              </option>
              {props.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
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
            maxLength={maxLength}
            min={props.min}
            max={props.max}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={inputBaseClasses}
          />
        )}
      </div>

      {error ? (
        <div id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-[11px] text-slate-400 pt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
