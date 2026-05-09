import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    emoji: '🍔',
    title: 'Beat Your Cravings!',
    subtitle: 'Order delicious food from PUCIT campus canteens & nearby restaurants.',
    bg: '#fff4f0',
  },
  {
    emoji: '🛵',
    title: 'Fast Delivery',
    subtitle: 'Get your favourite food delivered hot & fresh within minutes.',
    bg: '#fff8f5',
  },
  {
    emoji: '🎉',
    title: "Let's Get Started!",
    subtitle: 'Sign up now and enjoy exclusive deals and recommendations.',
    bg: '#fffaf8',
  },
];

export default function SplashScreen() {
  const navigate  = useNavigate();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { navigate('/home', { replace: true }); }
  }, []);

  const next = () => {
    if (idx < slides.length - 1) setIdx(idx + 1);
    else navigate('/login');
  };

  const slide = slides[idx];

  return (
    <div className="app-container flex flex-col items-center justify-between px-8 py-16"
         style={{ backgroundColor: slide.bg }}>
      {/* Dots */}
      <div className="flex gap-2 self-end">
        {slides.map((_, i) => (
          <div key={i}
               className={`h-2 rounded-full transition-all duration-300 
                           ${i === idx ? 'w-6 bg-primary-600' : 'w-2 bg-neutral-300'}`} />
        ))}
      </div>

      {/* Illustration */}
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}
          className="text-center flex flex-col items-center gap-6"
        >
          <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center
                          shadow-xl text-[110px]">
            {slide.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-3">{slide.title}</h1>
            <p className="text-base text-neutral-500 leading-relaxed">{slide.subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <button onClick={next} className="btn-primary text-lg py-4 rounded-2xl">
        {idx < slides.length - 1 ? 'Next →' : "Let's Beat Cravings"}
      </button>
    </div>
  );
}
