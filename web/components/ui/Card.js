export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={`
      bg-white rounded-2xl border border-[#e2e8f0] shadow-sm
      ${padding ? 'p-6' : ''}
      ${hover ? 'hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200 cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}