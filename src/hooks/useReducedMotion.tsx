import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  prefersReducedMotion,
  shouldUseLenis,
  subscribeReducedMotion,
} from '@/utils/motion';

interface MotionPreferencesContextValue {
  reducedMotion: boolean;
  lenisEnabled: boolean;
  toggleReducedMotion: () => void;
}

const MotionPreferencesContext = createContext<MotionPreferencesContextValue | null>(null);

const STORAGE_KEY = 'portfolio-reduced-motion';

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return prefersReducedMotion();
}

export function MotionPreferencesProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(reducedMotion));
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    return subscribeReducedMotion((systemReduced) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setReducedMotion(systemReduced);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      reducedMotion,
      lenisEnabled: !reducedMotion && shouldUseLenis(),
      toggleReducedMotion: () => setReducedMotion((prev) => !prev),
    }),
    [reducedMotion],
  );

  return (
    <MotionPreferencesContext.Provider value={value}>
      {children}
    </MotionPreferencesContext.Provider>
  );
}

export function useMotionPreferences(): MotionPreferencesContextValue {
  const context = useContext(MotionPreferencesContext);
  if (!context) {
    throw new Error('useMotionPreferences must be used within MotionPreferencesProvider');
  }
  return context;
}
