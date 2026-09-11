// src/components/ui/Confetti.jsx
import { useEffect, useState } from 'react';

export function Confetti({ trigger = false, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
      duration: Math.random() * 1.5 + 1.5,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function ConfettiBurst({ trigger = false }) {
  const [show, setShow] = useState(false);
  const [bursts] = useState(() => 
    Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * 360;
      const distance = Math.random() * 200 + 100;
      const size = Math.random() * 8 + 4;
      return { id: i, angle, distance, size };
    })
  );

  useEffect(() => {
    if (trigger) {
      setShow(true);
      setTimeout(() => setShow(false), 2500);
    }
  }, [trigger]);

  if (!show) return null;

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {bursts.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: colors[b.id % colors.length],
            animation: `burst-${b.id} 1.5s ease-out forwards`,
          }}
        />
      ))}
      
      <style>{`
        ${bursts.map((b) => {
          const rad = (b.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * b.distance;
          const ty = Math.sin(rad) * b.distance;
          return `
            @keyframes burst-${b.id} {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${tx}px, ${ty}px) scale(0);
                opacity: 0;
              }
            }
          `;
        }).join('')}
      `}</style>
    </div>
  );
}