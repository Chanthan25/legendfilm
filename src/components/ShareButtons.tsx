import { Twitter, Facebook, Instagram, Send, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function ShareButtons({ title, url }: { title: string, url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8">
      <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mr-2">Share:</span>
      
      <button 
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')} 
        className="p-2.5 bg-zinc-900/80 hover:bg-[#1DA1F2] text-zinc-400 hover:text-white rounded-full transition-all duration-300 border border-zinc-800 hover:border-[#1DA1F2] hover:shadow-lg hover:shadow-[#1DA1F2]/20 hover:-translate-y-1" 
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')} 
        className="p-2.5 bg-zinc-900/80 hover:bg-[#4267B2] text-zinc-400 hover:text-white rounded-full transition-all duration-300 border border-zinc-800 hover:border-[#4267B2] hover:shadow-lg hover:shadow-[#4267B2]/20 hover:-translate-y-1" 
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')} 
        className="p-2.5 bg-zinc-900/80 hover:bg-[#0088cc] text-zinc-400 hover:text-white rounded-full transition-all duration-300 border border-zinc-800 hover:border-[#0088cc] hover:shadow-lg hover:shadow-[#0088cc]/20 hover:-translate-y-1" 
        aria-label="Share on Telegram"
      >
        <Send className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => window.open(`https://instagram.com`, '_blank')} 
        className="p-2.5 bg-zinc-900/80 hover:bg-[#E1306C] text-zinc-400 hover:text-white rounded-full transition-all duration-300 border border-zinc-800 hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/20 hover:-translate-y-1" 
        aria-label="Share on Instagram"
      >
        <Instagram className="w-4 h-4" />
      </button>

      <button 
        onClick={handleCopy} 
        className="p-2.5 bg-zinc-900/80 hover:bg-[#00f2fe] text-zinc-400 hover:text-zinc-950 rounded-full transition-all duration-300 border border-zinc-800 hover:border-[#00f2fe] hover:shadow-lg hover:shadow-[#00f2fe]/20 hover:-translate-y-1" 
        aria-label="Share on TikTok"
      >
        <TikTokIcon className="w-4 h-4" />
      </button>
      
      <button 
        onClick={handleCopy} 
        className="p-2.5 bg-zinc-900/80 hover:bg-amber-500 text-zinc-400 hover:text-zinc-950 rounded-full transition-all duration-300 border border-zinc-800 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 flex items-center gap-2" 
        aria-label="Copy Link"
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        <span className="text-xs font-bold hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
