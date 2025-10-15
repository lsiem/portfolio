// Common Framer Motion variants and transitions for the portfolio

// Check if user prefers reduced motion
const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Transition configurations
export const transitions = {
  default: {
    duration: prefersReducedMotion ? 0.1 : 0.6,
    ease: "easeOut"
  },
  slow: {
    duration: prefersReducedMotion ? 0.1 : 1,
    ease: "easeOut"
  },
  spring: {
    type: "spring",
    stiffness: prefersReducedMotion ? 300 : 100,
    damping: prefersReducedMotion ? 30 : 20
  }
};

// Animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: transitions.default
};

export const slideUp = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.default
};

export const slideDown = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.default
};

export const slideLeft = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.default
};

export const slideRight = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.default
};

export const scaleIn = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: transitions.spring
};

export const fadeAndSlide = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.slow
};

// Container variants for staggered animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.1,
      delayChildren: prefersReducedMotion ? 0 : 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.default
};
