'use client';
// Place this file at: app/admin/layout.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminSidebar from './_components/AdminSidebar';

export default function AdminLayout({ children }) {
  const router             = useRouter();
  const [user, setUser]    = useState(null);
  const [ready, setReady]  = useState(false); // 'ready' = auth check done + passed

  useEffect(() => {
    const token  = Cookies.get('token');
    const stored = Cookies.get('user');

    // No token at all → back to login
    if (!token || !stored) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      // Wrong role → send them where they belong
      if (parsed.role !== 'ADMIN') {
        router.replace(
          parsed.role === 'AGENCY_STAFF' ? '/staff/applications' : '/dashboard'
        );
        return;
      }

      setUser(parsed);
      setReady(true);
    } catch {
      // Corrupt cookie — clear and send to login
      Cookies.remove('token');
      Cookies.remove('user');
      router.replace('/login');
    }
  }, []);

  // ── Checking screen ──────────────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Logo pulse */}
          <div className="relative">
            <div className="w-14 h-14 bg-[#f59e0b]/20 rounded-2xl animate-ping absolute inset-0" />
            <div className="w-14 h-14 bg-[#f59e0b] rounded-2xl flex items-center justify-center relative">
              <span className="text-[#0f172a] font-black text-2xl">M</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-bold text-sm">Mala-Link</p>
            <p className="text-[#475569] text-xs">Verifying admin access…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated admin layout ────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar user={user} />

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}