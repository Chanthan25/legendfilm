import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MessageSquare, Sliders, Heart, X, Send, Play, Sparkles, 
  Trash2, Volume2, VolumeX, Moon, Zap, User, HelpCircle 
} from 'lucide-react';
import { getDramas } from '../lib/api';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isUser?: boolean;
}

const KHMER_NAMES = [
  'សង់ សុវណ្ណ', 'លី ណារី', 'ចាន់ ពិសិដ្ឋ', 'កែវ បុប្ផា', 'គង់ សុខា', 'ជា ម៉ានី', 'សែម វីរៈ', 'ភី សម្បត្តិ'
];

const MOCK_CHAT_POOL = [
  'តើភាគថ្មីរបស់ Legend | Film ចេញល្ងាចនេះមែនទេ? ចង់មើលខ្លាំងណាស់!',
  'រឿងចិនបុរាណថ្មីនេះល្អមើលណាស់ តួសមប្រកបគ្នាខ្លាំង!',
  'ខ្ញុំឱ្យរឿងនេះ 10/10 ព្រោះសាច់រឿងរំភើបប្លែកភ្នែក!',
  'ចុះរឿងភាគខ្មែរថ្មីរបស់ Legend | Film ណាខ្លះល្អមើលជាងគេហ្នុង?',
  'ទើបតែសរសេរការវាយតម្លៃ (Review) រួចរាល់ មិត្តភក្តិទាំងអស់គ្នាអាចអានបាន!',
  'វេបសាយនេះដំណើរការលឿនស្រួលមើលណាស់ ជាពិសេសពេលប្តូរស្បែក 7 ពណ៌!',
  'តួឯកប្រុសស្អាតសាហាវណាស់ ចាំគាំទ្ររាល់ភាគតែម្តង!',
  'សូមបងប្អូនកុំភ្លេចចុច like និង share ឱ្យបានច្រើនផងណា៎!'
];

export default function SidebarFeatures() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'chat' | 'cinemood' | 'watchlist'>('calendar');
  const [dramas, setDramas] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  
  // Weekly Schedule Data State
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Mon, 6 = Sun
  
  // Chat Simulation States
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'លី ណារី', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80', text: 'សួស្តីអ្នកទាំងអស់គ្នា! មានរឿងអីល្អមើលខ្លះថ្ងៃនេះ?', time: '05:40' },
    { id: '2', sender: 'គង់ សុខា', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80', text: 'រឿងចិនបុរាណកំពុងចាក់ផ្សាយហ្នឹងសាហាវ ល្អមើលណាស់!', time: '05:41' },
    { id: '3', sender: 'សង់ សុវណ្ណ', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&fit=crop&q=80', text: 'ខ្ញុំយល់ស្រប! Trailer របស់វាទើបតែបញ្ចូលល្ងាចមិញ!', time: '05:43' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cinema Mood Audio Synthesis State
  const [dimmerLevel, setDimmerLevel] = useState(0); // 0 to 90 (represents opacity % of dark backdrop)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<any>(null);

  // Load dramas to populate features
  useEffect(() => {
    async function loadDramas() {
      try {
        const list = await getDramas();
        setDramas(list || []);
      } catch (err) {
        console.error('Error loading sidebar dramas:', err);
      }
    }
    loadDramas();
  }, [isOpen]);

  // Sync Watchlist from localStorage
  useEffect(() => {
    const handleWatchlistChange = () => {
      try {
        const keys = Object.keys(localStorage);
        const watchlistKeys = keys.filter(k => k.startsWith('watchlist_') || k === 'local_watchlist' || k.includes('watchlist'));
        // Build watchlist from local storage
        let list: any[] = [];
        
        // Grab values
        watchlistKeys.forEach(k => {
          try {
            const data = localStorage.getItem(k);
            if (data) {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed)) {
                list = [...list, ...parsed];
              } else if (parsed && typeof parsed === 'object') {
                list.push(parsed);
              }
            }
          } catch(e) {}
        });

        // Unique filter by ID
        const uniqueList = list.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setWatchlist(uniqueList);
      } catch (e) {
        console.error(e);
      }
    };

    handleWatchlistChange();
    
    // Listen to changes
    window.addEventListener('storage', handleWatchlistChange);
    const interval = setInterval(handleWatchlistChange, 3000); // Check periodically
    
    return () => {
      window.removeEventListener('storage', handleWatchlistChange);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Chat Auto-scrolling
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Chat simulation response loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'chat') return;

    const interval = setInterval(() => {
      const randomName = KHMER_NAMES[Math.floor(Math.random() * KHMER_NAMES.length)];
      const randomMsg = MOCK_CHAT_POOL[Math.floor(Math.random() * MOCK_CHAT_POOL.length)];
      const randomPicId = Math.floor(Math.random() * 70);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMsg: Message = {
        id: String(Date.now()),
        sender: randomName,
        avatar: `https://i.pravatar.cc/100?img=${randomPicId}`,
        text: randomMsg,
        time: timeStr
      };

      setMessages(prev => [...prev, newMsg]);
    }, 15000); // add a simulated fan chat every 15 seconds

    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // Web Audio Synthesis for Cinema Projector Sound & Calm Ambient Rain
  const toggleSoundEffects = () => {
    if (soundEnabled) {
      // Turn off
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setSoundEnabled(false);
    } else {
      // Init Audio Context and generate organic vintage sound
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Vintage Cinema Projector "Click-Whirr" sound simulation using custom synthesizer nodes
        // Generating low rumbling sound + sporadic clicks
        soundIntervalRef.current = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          
          const now = audioCtxRef.current.currentTime;
          // low rumble hump
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(65, now);
          osc.frequency.setValueAtTime(45, now + 0.15);
          
          gain.gain.setValueAtTime(0.012, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
          
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          
          osc.start();
          osc.stop(now + 0.15);

          // high click
          if (Math.random() > 0.4) {
            const clickOsc = audioCtxRef.current.createOscillator();
            const clickGain = audioCtxRef.current.createGain();
            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(800 + Math.random() * 400, now);
            clickGain.gain.setValueAtTime(0.005, now);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
            clickOsc.connect(clickGain);
            clickGain.connect(audioCtxRef.current.destination);
            clickOsc.start();
            clickOsc.stop(now + 0.02);
          }
        }, 180); // steady tempo click-clack

        setSoundEnabled(true);
      } catch (err) {
        console.error('Web Audio API not supported or blocked:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'អ្នកប្រើប្រាស់ (You)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80',
      text: inputMessage,
      time: timeStr,
      isUser: true
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Trigger instant cute simulated reply
    setTimeout(() => {
      const botResponses = [
        'បាទ/ចាស! ពិតណាស់ ខ្ញុំសប្បាយចិត្តណាស់ដែលបានលឺបែបនេះ!',
        'wow ល្អខ្លាំងណាស់ ខ្ញុំក៏យល់ស្របនឹងមតិមួយហ្នឹងដែរ!',
        'រង់ចាំទស្សនាភាគថ្មីជាមួយគ្នាណា៎! រួសរាន់ឡើង!',
        'តើអ្នកចូលចិត្តស្បែកពណ៌មាសអធិរាជ ឬមួយស្បែកពណ៌ផ្សេងទៀតនៅក្នុងវេបសាយនេះ?'
      ];
      const randomText = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: KHMER_NAMES[Math.floor(Math.random() * KHMER_NAMES.length)],
        avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 50)}`,
        text: randomText,
        time: timeStr
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1800);
  };

  // Helper calculation for schedule
  const DAYS_KHMER = [
    { title: 'ច័ន្ទ', en: 'Monday' },
    { title: 'អង្គារ', en: 'Tuesday' },
    { title: 'ពុធ', en: 'Wednesday' },
    { title: 'ព្រហស្បតិ៍', en: 'Thursday' },
    { title: 'សុក្រ', en: 'Friday' },
    { title: 'សៅរ៍', en: 'Saturday' },
    { title: 'អាទិត្យ', en: 'Sunday' }
  ];

  // Distribute dramas mockingly into week days to make it look full-fledged
  const getDramasForDay = (dayIndex: number) => {
    if (dramas.length === 0) return [];
    // seed based on index
    return dramas.filter((_, idx) => (idx + dayIndex) % 3 === 0);
  };

  const removeWatchlistLocal = (dramaId: string) => {
    try {
      localStorage.removeItem(`watchlist_${dramaId}`);
      // Dispatch storage event to self to update active states
      window.dispatchEvent(new Event('storage'));
    } catch(e) {}
  };

  return (
    <>
      {/* Immersive Theater Overlay Dimmer */}
      {dimmerLevel > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-40 transition-all duration-300 bg-black"
          style={{ opacity: dimmerLevel / 100 }}
        />
      )}

      {/* Floating Sparkly Glow Button on Right Screen edge */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-amber-500 hover:bg-amber-400 text-black py-4 px-2.5 rounded-l-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-l-2 border-y-2 border-white/20 flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 hover:-translate-x-1"
        id="sidebar-trigger-btn"
      >
        <Sparkles className="w-4 h-4 animate-bounce text-zinc-950 group-hover:scale-110" />
        <span className="text-[10px] font-black uppercase tracking-widest writing-mode-vertical text-zinc-950">
          មុខងារថ្មីៗ 
        </span>
        <span className="text-[9px] font-bold text-amber-950 tracking-tight">NEW</span>
      </button>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sidebar Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-zinc-950/98 border-l border-zinc-800/80 shadow-2xl z-50 flex flex-col"
            >
              {/* Sidebar Header with Glowing Border */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5 Kh-font">
                      របារមុខងារពិសេស <span className="text-amber-500 text-xs">PRO</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-tight">Interactive Cinema Companions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Functional Navigation Tabs */}
              <div className="grid grid-cols-4 border-b border-zinc-800/60 bg-zinc-900/10 p-2 gap-1 text-[11px] font-semibold text-center">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'calendar' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>កាលវិភាគ</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>បន្ទប់ជជែក </span>
                </button>
                <button
                  onClick={() => setActiveTab('cinemood')}
                  className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'cinemood' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>រោងកុនអំពូល</span>
                </button>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'watchlist' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>បញ្ជីកុន {watchlist.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full scale-75">{watchlist.length}</span>}</span>
                </button>
              </div>

              {/* Features Content body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* TAB 1: CALENDAR & BROADCAST PREFERENCE */}
                {activeTab === 'calendar' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                      <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest leading-relaxed">កាលវិភាគចេញភាគថ្មី</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">រង់ចាំតាមដានភាគថ្មីៗនៃរឿងភាគចិនដែលអ្នកចូលចិត្តប្រចាំថ្ងៃ</p>
                    </div>

                    {/* Day Selection Slider */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      {DAYS_KHMER.map((d, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDay(index)}
                          className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            selectedDay === index 
                              ? 'bg-amber-500 text-black border-amber-400' 
                              : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[13px]">{d.title}</div>
                          <div className="text-[8px] opacity-70 uppercase tracking-tighter">{d.en.substring(0, 3)}</div>
                        </button>
                      ))}
                    </div>

                    {/* Scheduled Dramas */}
                    <div className="space-y-2 mt-2">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">រឿងភាគបញ្ចាំងថ្ងៃនេះ</div>
                      {getDramasForDay(selectedDay).length > 0 ? (
                        getDramasForDay(selectedDay).map((drama) => (
                          <div 
                            key={drama.id}
                            className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl hover:border-zinc-800 transition-colors group"
                          >
                            <img 
                              src={drama.poster} 
                              alt={drama.title} 
                              className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-zinc-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-white truncate group-hover:text-amber-500 transition-colors uppercase">{drama.title}</h4>
                              <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>ភាគបន្តចេញល្ងាចនេះ (8:00 PM)</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{drama.category}</span>
                                <span className="text-[9px] text-amber-500">⭐ {drama.rating || 'N/A'}</span>
                              </div>
                            </div>
                            <Link 
                              to={`/drama/${drama.id}`}
                              onClick={() => setIsOpen(false)}
                              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors text-zinc-400"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-zinc-500 text-xs text-muted flex flex-col items-center gap-2 border border-zinc-850 border-dashed rounded-xl">
                          <HelpCircle className="w-8 h-8 text-zinc-700" />
                          <span>ពុំមានកាលវិភាគបញ្ចាំងថ្មីសម្រាប់ថ្ងៃនេះទេ</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE SIMULATED GROUP CHAT */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-[calc(100vh-180px)]">
                    {/* Live Indicator banner */}
                    <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-xl mb-3 text-[11px] leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="font-bold text-zinc-200 uppercase tracking-widest font-mono">បន្ទប់ជជែក Live Chat</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full font-mono">234 Online</span>
                    </div>

                    {/* Chat Messages Scrolling */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 custom-scrollbar">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex gap-2.5 items-start ${msg.isUser ? 'flex-row-reverse' : ''}`}
                        >
                          <img 
                            src={msg.avatar} 
                            alt={msg.sender} 
                            className="w-8 h-8 rounded-full border border-zinc-800 flex-shrink-0 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80';
                            }}
                          />
                          <div className={`max-w-[76%] ${msg.isUser ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] font-black text-zinc-300">{msg.sender}</span>
                              <span className="text-[8px] text-zinc-500 font-mono">{msg.time}</span>
                            </div>
                            <div className={`p-2.5 rounded-2xl text-[11.5px] leading-relaxed break-words shadow-md ${
                              msg.isUser 
                                ? 'bg-amber-500 text-black font-medium rounded-tr-none' 
                                : 'bg-zinc-900 border border-zinc-850 text-zinc-100 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Form Input */}
                    <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="សរសេរសារជជែកនៅទីនេះ..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-zinc-500"
                      />
                      <button
                        type="submit"
                        className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: CINEMA MOOD & AMBIENT GLOW FILTERS */}
                {activeTab === 'cinemood' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      <Moon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-sm font-bold text-center text-zinc-100 uppercase tracking-widest leading-relaxed">របៀបរោងកុនអំពូល</h3>
                      <p className="text-[11px] text-zinc-400 text-center mt-1">លៃតម្រូវពន្លឺអេក្រង់ និងបង្កើតបរិយាកាសទស្សនាកាន់តែស៊ីជម្រៅ</p>
                    </div>

                    {/* Cinema Overlay Dimmer Slider */}
                    <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-200">បន្ថយពន្លឺអេក្រង់ (Cine-Dimmer)</span>
                        <span className="text-xs text-amber-500 font-mono font-bold">{dimmerLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="85"
                        value={dimmerLevel}
                        onChange={(e) => setDimmerLevel(Number(e.target.value))}
                        className="w-full accent-amber-500 bg-zinc-850 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                      <p className="text-[9px] text-zinc-500 mt-2">អូសទៅស្តាំ ដើម្បីបិទពន្លឺវែបសាយជុំវិញ និងផ្តោតលើតែវីដេអូ ឬអត្ថបទ។</p>
                    </div>

                    {/* Synthesized Film Projector Sound Controller */}
                    <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">សំឡេងម៉ាស៊ីនបញ្ចាំងហ្វ៊ីល</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-[220px]">សំឡេងត្រាក់ៗសម្លេង vintage projector ជំនួយអារម្មណ៍ពេលអាន Review</p>
                      </div>
                      <button
                        onClick={toggleSoundEffects}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          soundEnabled 
                            ? 'bg-amber-500 text-black' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {soundEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="bg-zinc-900/65 border border-zinc-850 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-zinc-200 mb-2">គន្លឹះទស្សនា</h4>
                      <ul className="text-[10px] text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                        <li>ប្តូរទំហំវីដេអូទៅជា Theater Mode (16:9 ពេញអេក្រង់)</li>
                        <li>ជ្រើសរើសស្បែក 7 ពណ៌ក្នុងរបាររុករកដើម្បីផ្គូរផ្គងពន្លឺ ambient</li>
                        <li>បើកសំឡេងម៉ាស៊ីនបញ្ចាំងហ្វ៊ីល ដើម្បីទទួលបានបរិយាកាសដូចក្នុងរោងកុនពិតៗ</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 4: WATCHLIST QUICK BOOKMARK */}
                {activeTab === 'watchlist' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                      <Heart className="w-6 h-6 text-red-500 mx-auto mb-2 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest leading-relaxed">រង្វង់បញ្ជីរង់ចាំមើល</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">រឿងដែលអ្នកបានរក្សាទុកសម្រាប់ទស្សនារហ័ស</p>
                    </div>

                    <div className="space-y-3.5 mt-2">
                      {watchlist.length > 0 ? (
                        watchlist.map((drama) => (
                          <div 
                            key={drama.id}
                            className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl hover:border-zinc-800 transition-all group relative overflow-hidden"
                          >
                            <img 
                              src={drama.poster} 
                              alt={drama.title} 
                              className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-zinc-850"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-white truncate uppercase group-hover:text-amber-500 transition-colors">{drama.title}</h4>
                              <p className="text-[10px] text-zinc-400 mt-1">{drama.category || 'ចម្រុះ'}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] text-amber-500">⭐ {drama.rating || 'N/A'}</span>
                                <span className="text-[9px] text-zinc-500 font-mono">{drama.episodes || '??'} ភាគ</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 z-10">
                              <Link 
                                to={`/drama/${drama.id}`}
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg bg-zinc-850 text-zinc-300 hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors"
                                title="មើលឥឡូវនេះ"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => removeWatchlistLocal(drama.id)}
                                className="w-8 h-8 rounded-lg bg-zinc-850 text-zinc-400 hover:bg-red-500/15 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                                title="លុបជំនួសវិញ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-zinc-500 text-xs flex flex-col items-center gap-2.5 border border-zinc-850 border-dashed rounded-xl">
                          <Heart className="w-8 h-8 text-zinc-800" />
                          <span className="leading-relaxed">អ្នកមិនទាន់មានរឿងក្នុងបញ្ជីរង់ចាំទស្សនានៅឡើយទេ<br />សូមចុចរូបបេះដូងនៅលើព័ត៌មានរឿង ដើម្បីរក្សាទុក!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer credit panel */}
              <div className="p-3.5 border-t border-zinc-850 bg-zinc-900/40 text-center text-[10px] text-zinc-500 tracking-wider">
                LEGEND | FILM VIP COMPANION
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
