const variants = {
  PENDING:    'bg-amber-50   text-amber-700   border-amber-200',
  PROCESSING: 'bg-blue-50    text-blue-700    border-blue-200',
  PRINTING:   'bg-purple-50  text-purple-700  border-purple-200',
  READY:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  COLLECTED:  'bg-slate-50   text-slate-500   border-slate-200',
  REJECTED:   'bg-red-50     text-red-600     border-red-200',
  CITIZEN:    'bg-blue-50    text-blue-700    border-blue-200',
  ADMIN:      'bg-purple-50  text-purple-700  border-purple-200',
  AGENCY_STAFF:'bg-amber-50  text-amber-700   border-amber-200',
};

export default function Badge({ label, variant }) {
  const style = variants[variant] || 'bg-slate-50 text-slate-500 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label || variant}
    </span>
  );
}