export default function StatCard({ label, value, icon: Icon, color = 'navy' }) {
  const colors = {
    navy:   'bg-[#0f172a] text-white',
    gold:   'bg-[#f59e0b] text-[#0f172a]',
    green:  'bg-emerald-500 text-white',
    blue:   'bg-blue-500 text-white',
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20}/>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
        <p className="text-xs text-[#525458] font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}