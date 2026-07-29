import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Paperclip, User, ShieldCheck } from 'lucide-react';
import { fetchInternalMessages, sendInternalMessage } from '../../services/enterpriseApi';

export default function InternalMessagingPage({ entityType = 'LOAN', entityId = 'LN-2026-0891' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const loadMessages = () => {
    fetchInternalMessages(entityType, entityId).then((data) => setMessages(data || []));
  };

  useEffect(() => {
    loadMessages();
  }, [entityType, entityId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendInternalMessage({
      entityType,
      entityId,
      senderRole: 'LOAN_OFFICER',
      senderName: 'Mary Wambui (Loan Officer)',
      text,
    });
    setText('');
    loadMessages();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1 text-sm uppercase">
            <MessageSquare className="w-4 h-4" /> Transaction-Linked Messaging
          </div>
          <h1 className="text-3xl font-extrabold">Internal Secure Messaging Desk</h1>
          <p className="text-slate-300 text-sm mt-1">
            Contextual conversation threads linked to active loan applications, withdrawals, and member files.
          </p>
        </div>
        <div className="bg-purple-500/20 border border-purple-400/30 px-4 py-2 rounded-xl text-right backdrop-blur">
          <p className="text-xs text-purple-200 uppercase font-semibold">Active Context Thread</p>
          <p className="text-md font-bold text-purple-300">{entityType}: {entityId}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Chat Feed */}
        <div className="space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
          {messages.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-indigo-700">{m.senderName}</span>
                <span className="text-slate-400">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Type contextual internal note or message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" /> Send Note
          </button>
        </form>
      </div>
    </div>
  );
}
