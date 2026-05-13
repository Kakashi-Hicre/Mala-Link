export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[#64748b] text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}