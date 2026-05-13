'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';
import {
  LayoutDashboard, FilePlus, Search, FolderOpen,
  Bell, User, LogOut, ChevronRight,
} from 'lucide-react';

export default function Sidebar({ user, unread = 0 }) {
  const { t }    = useTranslation();
  const pathname = usePathname();
  const router   = useRouter();

  // ── navItems INSIDE the component so t() is available ──
  const navItems = [
    { label: t('nav.dashboard'),     href: '/dashboard',               icon: LayoutDashboard },
    { label: t('nav.apply'),         href: '/dashboard/apply',         icon: FilePlus },
    { label: t('nav.track'),         href: '/dashboard/track',         icon: Search },
    { label: t('nav.documents'),     href: '/dashboard/documents',     icon: FolderOpen },
    { label: t('nav.notifications'), href: '/dashboard/notifications', icon: Bell },
    { label: t('nav.profile'),       href: '/dashboard/profile',       icon: User },
  ];

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0f172a] flex flex-col z-40">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center text-lg font-black text-[#0f172a]">
            M
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Mala-Link</p>
            <p className="text-[#64748b] text-xs mt-0.5">Citizen Services</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          // Check active notification by translated label won't work reliably
          // so we check the href instead
          const isNotif = href === '/dashboard/notifications';
          return (
            <Link key={href} href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? 'bg-[#f59e0b] text-[#0f172a]'
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                }
              `}>
              <Icon size={18} className="shrink-0"/>
              <span className="flex-1">{label}</span>
              {/* Unread badge — use href check not label string */}
              {isNotif && unread > 0 && (
                <span className={`
                  text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  ${active ? 'bg-[#0f172a] text-[#f59e0b]' : 'bg-[#f59e0b] text-[#0f172a]'}
                `}>
                  {unread}
                </span>
              )}
              {active && <ChevronRight size={14} className="ml-auto opacity-60"/>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/10 space-y-2">

        {/* Language toggle */}
        <LanguageToggle className="w-full justify-center"/>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-[#0f172a] font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName || 'Citizen'}</p>
            <p className="text-[#64748b] text-xs truncate">{user?.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#ef4444] hover:bg-red-500/10 transition-all duration-150">
          <LogOut size={16}/>
          {t('nav.signout')}
        </button>
      </div>
    </aside>
  );
}