'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationsAPI } from '@/lib/api';
import { Bell, Mail, MessageSquare, Smartphone, CheckCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const channelIcon = { SMS: MessageSquare, EMAIL: Mail, IN_APP: Smartphone };
const channelColor = {
  SMS:    'bg-emerald-50 text-emerald-600 border-emerald-200',
  EMAIL:  'bg-blue-50   text-blue-600   border-blue-200',
  IN_APP: 'bg-purple-50 text-purple-600 border-purple-200',
};

export default function NotificationsPage() {
  const { t } = useTranslation();                          // ← hook at top level
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    notificationsAPI.getMy()
      .then(res => { setNotifications(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => notificationsAPI.markAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Build subtitle: "3 unread notifications" or "All caught up"
  const subtitle = unreadCount > 0
    ? `${unreadCount} ${t(unreadCount === 1 ? 'notif.unread' : 'notif.unread.pl')}`
    : t('notif.caught.up');

  return (
    <DashboardLayout>
      <PageHeader
        title={t('notif.title')}
        subtitle={subtitle}
        action={unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={14}/> {t('notif.mark.all')}
          </Button>
        )}
      />

      {loading ? (
        <div className="text-center py-20 text-[#94a3b8]">{t('common.loading')}</div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-20">
          <Bell size={40} className="mx-auto text-[#cbd5e1] mb-4"/>
          <p className="font-semibold text-[#64748b]">{t('notif.empty')}</p>
          <p className="text-sm text-[#94a3b8] mt-1">{t('notif.empty.sub')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon  = channelIcon[n.channel] || Bell;
            const color = channelColor[n.channel] || '';
            return (
              <div key={n.id}
                className={`
                  bg-white rounded-2xl border-2 p-5 flex items-start gap-4 transition-all duration-200
                  ${n.isRead ? 'border-[#f1f5f9] opacity-70' : 'border-[#e2e8f0] shadow-sm'}
                `}>
                {/* Channel icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={16}/>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
                      {n.channel}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] flex-shrink-0"/>
                    )}
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">{n.message}</p>
                  <p className="text-xs text-[#94a3b8] mt-1.5">
                    {new Date(n.sentAt).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    {t('notif.mark.read')}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}