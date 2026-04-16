"use client";

import { Share2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function ShareArticle({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${title} - Leia no Blog GranaHub`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-granahub-primary" />
        <span className="font-semibold text-granahub-text">Compartilhe este artigo</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-granahub-text font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {copied ? 'Copiado!' : 'Copiar Link'}
        </button>
      </div>
    </div>
  );
}
