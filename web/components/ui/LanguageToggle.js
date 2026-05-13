'use client';
import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLang } = useTranslation();
  const isChichewa = lang === 'ny';

  return (
    <button
      onClick={toggleLang}
      title={isChichewa ? 'Switch to English' : 'Sinthani ku Chichewa'}
      className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl
        border text-xs font-bold transition-all duration-200
        ${isChichewa
          ? 'bg-[#f59e0b] border-[#f59e0b] text-[#0f172a]'
          : 'bg-white/10 border-white/20 text-[#94a3b8] hover:text-white hover:border-white/40'}
        ${className}
      `}>
      {/* Flag emoji */}
      <span className="text-sm">🇲🇼</span>

      {/* Pill slider */}
      <div className="flex items-center gap-0.5 bg-black/10 rounded-lg px-1 py-0.5">
        <span className={`px-1.5 py-0.5 rounded-md text-xs font-black transition-all ${!isChichewa ? 'bg-white text-[#0f172a]' : 'text-current opacity-60'}`}>
          EN
        </span>
        <span className={`px-1.5 py-0.5 rounded-md text-xs font-black transition-all ${isChichewa ? 'bg-white text-[#0f172a]' : 'text-current opacity-60'}`}>
          NY
        </span>
      </div>
    </button>
  );
}