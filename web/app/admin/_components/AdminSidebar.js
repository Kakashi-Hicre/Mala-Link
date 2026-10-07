'use client';
// Place this file at: app/admin/_components/AdminSidebar.js

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, UserCog,
  FolderOpen, CreditCard, LogOut,
  ChevronRight, Shield,
} from 'lucide-react';

// ── Nav items — each maps to a future Phase page ─────────────
const NAV = [
  {
    label: 'Overview',
    href:  '/admin',
    icon:  LayoutDashboard,
    // Phase 2
  },
  {
    label: 'Citizens',
    href:  '/admin/citizens',
    icon:  Users,
    // Phase 3
  },
  {
    label: 'Agency Staff',
    href:  '/admin/staff',
    icon:  UserCog,
    // Phase 4
  },
  {
    label: 'Applications',
    href:  '/admin/applications',
    icon:  FolderOpen,
    // Phase 5
  },
  {
    label: 'ID Cards',
    href:  '/admin/cards',
    icon:  CreditCard,
    // Phase 5
  },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0f172a] flex flex-col z-40">

      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f59e0b] rounded-xl flex items-center justify-center shrink-0">
            <Shield size={16} className="text-[#0f172a]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Mala-Link</p>
            {/* Gold label distinguishes admin from citizen "Citizen Services" */}
            <p className="text-[#f59e0b] text-xs mt-0.5 font-semibold tracking-wide">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          // Exact match for /admin root, prefix match for everything else
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? 'bg-[#f59e0b] text-[#0f172a]'
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'}
              `}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight size={13} className="opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="p-3 border-t border-white/10 space-y-2">

        {/* Admin user card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center
                          text-[#0f172a] font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {user?.fullName || 'Admin'}
            </p>
            {/* Role label in gold — clearly different from citizen's grey subtitle */}
            <p className="text-[#f59e0b] text-xs font-medium">Administrator</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     font-medium text-[#ef4444] hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}