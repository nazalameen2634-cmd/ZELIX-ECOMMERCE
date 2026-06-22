'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareCode } from 'lucide-react';

export default function WhatsAppWidget() {
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+919876543210';
  const prefilledText = encodeURIComponent("Hello ZELIX Support, I have a question regarding my order.");
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${prefilledText}`;

  return (
    <div className="fixed bottom-6 left-6 z-[999] font-mono select-none">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-zinc-950 text-emerald-400 hover:text-white shadow-2xl flex flex-col gap-0.5 items-center justify-center border border-emerald-500/30 hover:border-emerald-400 transition-all rounded-full"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative flex flex-col items-center justify-center">
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          
          <MessageSquareCode size={18} />
          <span className="text-[7px] font-black tracking-widest mt-0.5 text-zinc-400">SUPPORT</span>
        </div>
      </motion.a>
    </div>
  );
}
