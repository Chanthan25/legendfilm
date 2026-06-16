import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, RefreshCw } from 'lucide-react';
import { getAccessToken } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';

export default function Inbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No access token available. Please sign in with Google.");
      }

      // 1. Get list of messages
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      const messageList = data.messages || [];

      // 2. Get details for each message
      const detailedMessages = await Promise.all(
        messageList.map(async (msg: any) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const detailData = await detailRes.json();
          
          // Extract Subject and From
          const headers = detailData.payload?.headers || [];
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown sender';

          return {
            id: msg.id,
            snippet: detailData.snippet,
            subject,
            from,
            date: new Date(parseInt(detailData.internalDate)).toLocaleString()
          };
        })
      );

      setMessages(detailedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your Inbox</h2>
          <Link to="/auth" className="text-amber-500 hover:text-amber-400 font-medium">Go to Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail className="w-8 h-8 text-amber-500" />
          Your Gmail Inbox
        </h1>
        <button 
          onClick={fetchEmails} 
          disabled={loading}
          className="flex items-center justify-center p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {loading && messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No messages found.</div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={msg.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <h3 className="font-semibold text-lg max-w-[80%] truncate text-zinc-100">{msg.subject}</h3>
                <span className="text-xs text-zinc-500 whitespace-nowrap mt-1 sm:mt-0">{msg.date}</span>
              </div>
              <p className="text-sm font-medium text-amber-500/80 mb-2 truncate">{msg.from}</p>
              <p className="text-sm text-zinc-400 line-clamp-2">{msg.snippet}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
