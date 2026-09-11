// src/hooks/useConfetti.js
import { useState, useCallback } from 'react';

export function useConfetti() {
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const fireConfetti = useCallback(() => {
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 100);
  }, []);

  return { confettiTrigger, fireConfetti };
}