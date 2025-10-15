// Common Framer Motion variants and transitions for the portfolio
import { prefersReducedMotion } from '../utils/motion';

// Factory function to get transition configurations based on current reduced motion preference
const getTransitions = () => {
  const reducedMotion = prefersReducedMotion();

  return {
    default: {
      duration: reducedMotion ? 0.1 : 0.6,
      ease: "easeOut"
    },
    slow: {
      duration: reducedMotion ? 0.1 : 1,
      ease: "easeOut"
    },
    spring: {
      type: "spring",
      stiffness: reducedMotion ? 300 : 100,
      damping: reducedMotion ? 30 : 20
    }
  };
};

// Factory functions that return animation variants based on current reduced motion preference
export const getFadeIn = () => {
  const trans = getTransitions();
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: trans.default
  };
};

export const getSlideUp = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: trans.default
  };
};

export const getSlideDown = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : -20 },
    animate: { opacity: 1, y: 0 },
    transition: trans.default
  };
};

export const getSlideLeft = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, x: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, x: 0 },
    transition: trans.default
  };
};

export const getSlideRight = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, x: reducedMotion ? 0 : -20 },
    animate: { opacity: 1, x: 0 },
    transition: trans.default
  };
};

export const getScaleIn = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, scale: reducedMotion ? 1 : 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: trans.spring
  };
};

export const getFadeAndSlide = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: trans.slow
  };
};

// Factory functions for staggered animations
export const getStaggerContainer = () => {
  const reducedMotion = prefersReducedMotion();
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
        delayChildren: reducedMotion ? 0 : 0.2
      }
    }
  };
};

export const getStaggerItem = () => {
  const reducedMotion = prefersReducedMotion();
  const trans = getTransitions();
  return {
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: trans.default
  };
};

// Optional helper to get all variants on demand
export const getAllVariants = () => ({
  fadeIn: getFadeIn(),
  slideUp: getSlideUp(),
  slideDown: getSlideDown(),
  slideLeft: getSlideLeft(),
  slideRight: getSlideRight(),
  scaleIn: getScaleIn(),
  fadeAndSlide: getFadeAndSlide(),
  staggerContainer: getStaggerContainer(),
  staggerItem: getStaggerItem()
});
