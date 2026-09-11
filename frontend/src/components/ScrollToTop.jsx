// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll ke atas setiap kali pathname berubah
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' | 'smooth' | 'auto'
    });
  }, [pathname]);

  return null; // Tidak render apa-apa
}