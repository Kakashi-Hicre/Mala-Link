'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  mugi,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  hint,
  error,
  icon: Icon,
  className = '',
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-[#0f4284]">
          {label}
          {required && <span className="text-[#f59e0b] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]">
            <Icon size={16}/>
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-xl border bg-white text-[#0f172a] text-sm
            placeholder:text-[#6a7584] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent
            ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-[#e2e8f0]'}
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-11' : 'pr-4'}
            py-3
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
          >
            {show ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        )}
      </div>

      {hint && !error && <p className="text-xs text-[#64748b]">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}