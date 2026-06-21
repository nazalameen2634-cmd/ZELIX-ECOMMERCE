'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CornerDownLeft, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'WHERE IS MY ORDER?', value: 'order_status' },
  { label: 'SHIPPING POLICIES', value: 'shipping' },
  { label: 'RETURN DIRECTIONS', value: 'returns' },
  { label: 'SIZING & FIT ASSIST', value: 'sizing' },
];

export default function SupportChat() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'WELCOME TO THE ZELIX DESIGN LAB HELP DESK. HOW CAN WE DIRECT YOUR EXPERIENCE TODAY?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (sender: 'user' | 'assistant', text: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender,
      text: text.toUpperCase(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getSystemResponse = (actionValue: string, userTyped?: string): string => {
    const name = profile?.full_name ? profile.full_name.toUpperCase() : 'GUEST';
    switch (actionValue) {
      case 'order_status':
        return `HELLO ${name}. TO TRACK AN ACTIVE ORDER, LOG IN AND VISIT YOUR ACCOUNT PAGE TO INPECT THE LIVE TIMELINE. STANDARD TRANSIT TAKES 2-3 BUSINESS DAYS.`;
      case 'shipping':
        return 'COMPLIMENTARY SHIPPING APPLIES TO ALL INDIAN DOMESTIC INVOICES EXCEEDING ₹5,000. FOR SMALLER INVOICES, A FLAT FLAT-RATE FEE OF ₹150 IS APPLIED.';
      case 'returns':
        return 'WE OFFER A 14-DAY RETURN POLICY FOR WEARABLE ITEMS IN UNWORN, ORIGINAL PACKAGED CONDITION. RETURN LABELS ARE INITIATED ON-DEMAND VIA ACCOUNT PAGE.';
      case 'sizing':
        return 'ZELIX ACTIVEWEAR INCORPORATES AN OVERSIZED ATHLETIC SILHOUETTE. WE ADVISE BUYERS TO ORDER THEIR STANDARD SIZE FOR A SLIGHTLY RELAXED CUT, OR SIZE DOWN FOR A SPORT FIT.';
      default:
        return `THANK YOU FOR CONVEYING YOUR QUERIES. AN EXECUTIVE FROM OUR TACTICAL DESIGN DIVISION WILL ENGAGE WITH YOU AT ${profile?.email || 'YOUR EMAIL'} WITHIN 2 HOURS. REFERENCE LOG REFERENCE #${Math.floor(100000 + Math.random() * 900000)}`;
    }
  };

  const handleActionClick = (action: { label: string; value: string }) => {
    if (isTyping) return;
    
    // Add User query
    addMessage('user', action.label);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      addMessage('assistant', getSystemResponse(action.value));
    }, 1200);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const query = inputValue;
    setInputValue('');
    addMessage('user', query);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage('assistant', getSystemResponse('default', query));
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-mono select-none">
      
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black hover:bg-neutral-200 shadow-2xl flex flex-col gap-1 items-center justify-center border border-white/20 transition-all rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              className="flex flex-col items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={16} />
              <span className="text-[7px] font-bold tracking-widest mt-0.5">HELP</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-18 right-0 w-[360px] max-w-[calc(100vw-32px)] h-[500px] bg-neutral-950 border border-white/10 rounded-lg flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header info */}
            <div className="bg-neutral-900/50 border-b border-white/5 px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-neutral-200">ZELIX // ASSISTANT</span>
              </div>
              <span className="text-[8px] text-neutral-500 tracking-wider">SECURE LINK</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin hide-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[8px] text-neutral-500 mb-1 tracking-widest">
                    {msg.sender === 'user' ? 'CLIENT' : 'SYSTEM'} //{' '}
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`px-3 py-2 text-[10px] tracking-wide leading-relaxed rounded-sm ${
                      msg.sender === 'user'
                        ? 'bg-white text-black font-semibold text-right'
                        : 'bg-neutral-900 text-neutral-200 border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loader indicator while thinking */}
              {isTyping && (
                <div className="self-start flex flex-col items-start max-w-[85%]">
                  <span className="text-[8px] text-neutral-500 mb-1 tracking-widest">SYSTEM // CONNECTING</span>
                  <div className="bg-neutral-900 border border-white/5 px-4 py-2.5 rounded-sm flex items-center justify-center">
                    <Loader size={12} className="animate-spin text-white" />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions Panel */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 py-2 bg-neutral-900/20 border-t border-white/5 flex flex-col gap-1.5">
                <span className="text-[8px] text-neutral-500 tracking-wider mb-0.5 uppercase">SUGGESTED CHANNELS:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleActionClick(action)}
                      className="text-left bg-neutral-900 hover:bg-neutral-800 border border-white/5 hover:border-white/20 p-2 text-[8px] font-bold tracking-widest text-neutral-300 transition-colors uppercase flex items-center justify-between"
                    >
                      {action.label}
                      <ArrowRight size={8} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing input field */}
            <form
              onSubmit={handleSendText}
              className="p-3 bg-neutral-900 border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="MESSAGE LAB HELPDESK..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-black/60 border border-white/5 focus:border-white/20 px-3 py-2 text-[10px] text-white tracking-widest uppercase placeholder:text-neutral-600 focus:outline-none transition-colors rounded-sm"
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="p-2 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors rounded-sm flex items-center justify-center"
              >
                <Send size={10} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
