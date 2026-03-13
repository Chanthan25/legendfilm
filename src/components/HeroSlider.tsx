import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Drama } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function HeroSlider({ dramas }: { dramas: Drama[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dramas.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dramas.length]);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000">
      <AnimatePresence mode="popLayout">
        {dramas.map((drama, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + dramas.length) % dramas.length;
          const isNext = index === (currentIndex + 1) % dramas.length;

          if (!isActive && !isPrev && !isNext) return null;

          let zIndex = 10;
          let x = 0;
          let scale = 1;
          let opacity = 1;

          if (isPrev) {
            zIndex = 0;
            x = -100;
            scale = 0.8;
            opacity = 0.5;
          } else if (isNext) {
            zIndex = 0;
            x = 100;
            scale = 0.8;
            opacity = 0.5;
          }

          return (
            <motion.div
              key={drama.id}
              initial={false}
              animate={{
                x,
                scale,
                opacity,
                zIndex,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute w-[280px] h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
            >
              <Link to={`/drama/${drama.id}`} className="block w-full h-full relative group">
                <img
                  src={drama.poster}
                  alt={drama.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{drama.title}</h3>
                  <p className="text-amber-500 text-sm font-semibold">{drama.rating} / 5</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
