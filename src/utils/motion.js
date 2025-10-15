/**
 * Motion utilities for consistent animation behavior across the app
 * Respects user preferences for reduced motion
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return true; // SSR safe
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 * @returns {boolean}
 */
export const prefersHighContrast = () => {
  if (typeof window === 'undefined') return false; // SSR safe
  return window.matchMedia('(prefers-contrast: more)').matches;
};

/**
 * Get animation duration based on user preferences
 * @param {number} normalDuration - Duration in seconds for normal motion
 * @param {number} reducedDuration - Duration in seconds for reduced motion (default: 0.01)
 * @returns {number}
 */
export const getAnimationDuration = (normalDuration, reducedDuration = 0.01) => {
  return prefersReducedMotion() ? reducedDuration : normalDuration;
};

/**
 * Get animation config for GSAP based on user preferences
 * @param {Object} config - Animation configuration
 * @returns {Object}
 */
export const getGSAPConfig = (config) => {
  if (prefersReducedMotion()) {
    return {
      ...config,
      duration: 0.01,
      delay: 0,
      ease: 'none',
    };
  }
  return config;
};

/**
 * Get Framer Motion variants with reduced motion support
 * @param {Object} variants - Motion variants
 * @returns {Object}
 */
export const getMotionVariants = (variants) => {
  if (prefersReducedMotion()) {
    // Return instant transitions
    const reducedVariants = {};
    Object.keys(variants).forEach(key => {
      reducedVariants[key] = {
        ...variants[key],
        transition: { duration: 0.01 },
      };
    });
    return reducedVariants;
  }
  return variants;
};

/**
 * Create a ScrollTrigger configuration with reduced motion support
 * @param {Object} config - ScrollTrigger configuration
 * @returns {Object|false}
 */
export const getScrollTriggerConfig = (config) => {
  if (prefersReducedMotion()) {
    return false; // Disable ScrollTrigger animations
  }
  return config;
};
