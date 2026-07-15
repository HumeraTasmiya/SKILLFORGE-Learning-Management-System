import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Maximize2, Mic, Paperclip, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { setChatbotOpen } from '../store/store.js';
import { api } from '../lib/api.js';

export function Chatbot() {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, I am Forge. Ask me for course help, code explanations, quiz hints, resume feedback, or interview practice.' },
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((items) => [...items, { role: 'user', text: trimmed }]);
    setText('');
    setSending(true);
    try {
      const { data } = await api.post('/chatbot/support', { message: trimmed });
      setMessages((items) => [...items, { role: 'assistant', text: data.reply || 'I am here to help.' }]);
    } catch {
      setMessages((items) => [
        ...items,
        { role: 'assistant', text: 'Support is temporarily unavailable. Please try again in a moment.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-24 right-5 z-50 flex h-[620px] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl dark:bg-slate-950"
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
        <div>
          <p className="font-black">Forge AI Assistant</p>
          <p className="text-xs text-slate-500">Context-aware learning support</p>
        </div>
        <div className="flex gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-900"><Maximize2 className="h-4 w-4" /></button>
          <button onClick={() => dispatch(setChatbotOpen(false))} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-900"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`rounded-2xl px-4 py-3 text-sm ${message.role === 'assistant' ? 'bg-slate-100 dark:bg-slate-900' : 'ml-auto bg-indigo-600 text-white'} max-w-[88%]`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-slate-900">
          <button className="grid h-9 w-9 place-items-center rounded-xl"><Paperclip className="h-4 w-4" /></button>
          <input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Ask Forge support..." className="min-w-0 flex-1 border-0 bg-transparent text-sm focus:ring-0" />
          <button className="grid h-9 w-9 place-items-center rounded-xl"><Mic className="h-4 w-4" /></button>
          <button onClick={send} disabled={sending} className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white disabled:opacity-60"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.aside>
  );
}
