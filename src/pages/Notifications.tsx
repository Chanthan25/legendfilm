import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadNotifications() {
      if (!user) return;
      setIsLoading(true);
      
      const q = query(collection(db, 'notifications'), where('user_id', '==', user.id));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs: any[] = [];
        snapshot.forEach(doc => {
          notifs.push({ id: doc.id, ...doc.data() });
        });
        notifs.sort((a, b) => b.created_at?.seconds - a.created_at?.seconds);
        setNotifications(notifs);
        setIsLoading(false);
      });
    }

    loadNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleMarkRead = async (id: string, read: boolean) => {
    if (read) return;
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 text-sm font-bold px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-amber-500 hover:text-amber-400 font-medium transition-colors text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No notifications yet</h3>
              <p className="text-zinc-400">When you get notifications, they'll show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 sm:p-6 flex items-start gap-4 transition-colors ${notification.read ? 'bg-zinc-900' : 'bg-zinc-800/50'}`}
                  onClick={() => handleMarkRead(notification.id, notification.read)}
                >
                  <div className="mt-1">
                    {notification.read ? (
                      <CheckCircle2 className="w-5 h-5 text-zinc-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm sm:text-base ${notification.read ? 'text-zinc-300' : 'text-white font-medium'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {notification.created_at ? new Date(notification.created_at.seconds * 1000).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
