'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from './Sidebar';
import { notificationsAPI } from '@/lib/api';

export default function DashboardLayout({ children }) {
  const router         = useRouter();
  const [user, setUser]   = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token  = Cookies.get('token');
    const stored = Cookies.get('user');

    if (!token) { router.push('/login'); return; }
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }

    // Load unread notification count for the badge
    notificationsAPI.getMy()
      .then(res => setUnread(res.data.data.filter(n => !n.isRead).length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} unread={unread}/>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}