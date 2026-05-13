export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  disabled,
  className = '',
}) {
  const base = `
    inline-flex items-center justify-center gap-2 font-semibold
    rounded-xl transition-all duration-200 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  `;

  const variants = {
    primary:   'bg-[#0f172a] text-white hover:bg-[#1e293b] active:scale-[0.98] focus-visible:ring-[#0f172a]',
    gold:      'bg-[#f59e0b] text-[#0f172a] hover:bg-[#d97706] active:scale-[0.98] focus-visible:ring-[#f59e0b]',
    outline:   'border-2 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white active:scale-[0.98]',
    ghost:     'text-[#64748b] hover:bg-slate-100 hover:text-[#0f172a]',
    danger:    'bg-[#ef4444] text-white hover:bg-red-600 active:scale-[0.98]',
    success:   'bg-[#10b981] text-white hover:bg-emerald-600 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}