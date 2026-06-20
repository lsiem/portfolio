import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { uiText } from '@/content/ui';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const { reducedMotion } = useMotionPreferences();

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), reducedMotion ? 0 : 1200);
    return () => window.clearTimeout(timeout);
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-space-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <div className="text-center">
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-accent">
              {uiText.loading.title}
            </p>
            <p className="mt-3 text-white/70">{uiText.loading.subtitle}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
