import React from 'react';
import { AppNotification, LanguageCode } from '../types';
import { t } from '../utils/translations';
import { Bell, CheckCheck, X, ArrowRight, ShieldCheck, Truck, ShoppingCart, TrendingUp, AlertTriangle, Star } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectOrder?: (orderId: string) => void;
  role?: 'farmer' | 'buyer' | 'academic';
  language?: LanguageCode;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectOrder,
  role = 'farmer',
  language = 'en',
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-emerald-700" />;
      case 'payment':
        return <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />;
      case 'transit':
        return <Truck className="w-4 h-4 text-amber-700" />;
      case 'market':
        return <TrendingUp className="w-4 h-4 text-blue-700" />;
    }
  };

  const drawerTitle = role === 'buyer'
    ? 'Buyer Order & Transit Alerts'
    : 'Farmer Mandi & Order Alerts';

  const drawerSubtitle = role === 'buyer'
    ? 'Dispatches, live Dijkstra tracking, price drop warnings & review reminders'
    : 'Incoming orders, escrow payments, weighbridge dispatches & buyer tickets';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#E2DAC5] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#1B4332] text-white flex items-center justify-between border-b-2 border-[#E9C46A]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bell className="w-5 h-5 text-[#E9C46A]" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                  <span>{role === 'buyer' ? '🛒' : '👨‍🌾'}</span>
                  <span>{drawerTitle}</span>
                </h3>
                <p className="text-[11px] text-[#E9C46A] mt-0.5 line-clamp-1">
                  {unreadCount > 0 ? `${unreadCount} unread alert(s)` : 'All caught up'} &bull; {role === 'buyer' ? 'Buyer Mode' : 'Farmer Mode'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded text-white flex items-center gap-1 transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader hint */}
          <div className="px-4 py-2 bg-[#FAF7EE] border-b border-[#E2DAC5] text-[11px] text-[#52796F]">
            {drawerSubtitle}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7EE]/60">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-[#52796F]">
                <Bell className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-medium">No alerts for this account</p>
                <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                  {role === 'buyer' 
                    ? 'Place orders or browse crops to receive live transit updates and price drops.'
                    : 'List your produce to receive automated buyer orders and APMC payment alerts.'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) onMarkAsRead(notif.id);
                    if (notif.orderId && onSelectOrder) {
                      onSelectOrder(notif.orderId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    notif.isRead
                      ? 'bg-white border-[#E2DAC5] opacity-80 hover:opacity-100'
                      : 'bg-white border-[#2D6A4F]/40 shadow-xs ring-1 ring-[#2D6A4F]/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#FAF7EE] shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-[#1B4332] truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mb-2">
                        {notif.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#52796F]">
                        <span>{notif.timestamp}</span>
                        {notif.orderId && (
                          <span className="text-[#2D6A4F] font-semibold flex items-center gap-1">
                            Track Order <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#FAF7EE] border-t border-[#E2DAC5] text-center text-xs text-[#52796F] font-medium">
            🌾 Agri Market Real-Time Notification Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

