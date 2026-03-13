import { ShieldAlert, Info, Copyright } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Legal & Disclaimer</h1>
          <p className="text-zinc-400 text-lg">
            Important information regarding content on Legend | Film.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-red-500" /> No Video Hosting
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              <strong className="text-white">Legend | Film does not host, upload, or distribute full drama videos, episodes, or full subtitles.</strong> 
              <br /><br />
              This website is strictly a review and analysis platform. We do not provide download links or streaming services for copyrighted video content.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Copyright className="w-6 h-6 text-amber-500" /> Copyright & Fair Use
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg mb-4">
              All content provided on this site falls under the principles of Fair Use for the purposes of commentary, criticism, and review.
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-3 ml-4">
              <li><strong className="text-zinc-200">Summaries:</strong> All story and episode summaries are originally written by our team and do not copy official transcripts.</li>
              <li><strong className="text-zinc-200">Images:</strong> Drama posters and limited screenshots are used solely for identification and illustrative purposes in reviews.</li>
              <li><strong className="text-zinc-200">Trailers:</strong> Video trailers are embedded directly from official YouTube channels using standard embed codes, driving views to the original creators.</li>
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-zinc-400 text-sm">
              If you believe any content on this site infringes upon your copyright, please contact us immediately, and we will address the issue promptly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
