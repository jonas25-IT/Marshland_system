import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationsList = () => {
  const { user, api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.notificationId === notificationId 
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString()
      })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'INFO': return 'bg-blue-500/10 text-blue-400';
      case 'WARNING': return 'bg-orange-500/10 text-orange-400';
      case 'ERROR': return 'bg-red-500/10 text-red-400';
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400';
      case 'ALERT': return 'bg-purple-500/10 text-purple-400';
      case 'BOOKING': return 'bg-cyan-500/10 text-cyan-400';
      case 'SYSTEM': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="glass-card-premium overflow-hidden">
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-1">Your Notifications</h2>
          <p className="text-xs text-gray-500 italic">
            {notifications.filter(n => !n.isRead).length} unread notification{notifications.filter(n => !n.isRead).length !== 1 ? 's' : ''}
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-20 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-pulse" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                <th className="p-6">Type</th>
                <th className="p-6">Title</th>
                <th className="p-6">Message</th>
                <th className="p-6">Status</th>
                <th className="p-6">Created</th>
                <th className="p-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <tr 
                  key={notification.notificationId} 
                  className={`hover:bg-white/[0.02] transition-colors ${!notification.isRead ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="font-semibold">{notification.title}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm text-gray-400">{notification.message}</p>
                    {notification.link && (
                      <a 
                        href={notification.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Link
                      </a>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      notification.isRead ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="p-6 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </td>
                  <td className="p-6">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notificationId)}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
