import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-bold text-zinc-50 tracking-wider uppercase">
                Legend <span className="text-red-600">|</span> Film
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your trusted source for original summaries, reviews, and analysis of Khmer and Chinese dramas. 
              We celebrate the art of storytelling.
            </p>
          </div>
          
          <div>
            <h3 className="text-zinc-50 font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-zinc-400 hover:text-amber-500 text-sm transition-colors">Home</Link></li>
              <li><Link to="/categories" className="text-zinc-400 hover:text-amber-500 text-sm transition-colors">Categories</Link></li>
              <li><Link to="/search" className="text-zinc-400 hover:text-amber-500 text-sm transition-colors">Search Dramas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-zinc-50 font-semibold mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/disclaimer" className="text-zinc-400 hover:text-amber-500 text-sm transition-colors">Disclaimer & Copyright</Link></li>
              <li><span className="text-zinc-500 text-sm">Privacy Policy</span></li>
              <li><span className="text-zinc-500 text-sm">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Legend | Film. All rights reserved.
          </p>
          <p className="text-zinc-500 text-xs text-center md:text-right max-w-md">
            Legend | Film does not host or distribute video content. We provide original written reviews, summaries, and embed official trailers only.
          </p>
        </div>
      </div>
    </footer>
  );
}
