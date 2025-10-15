import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Custom hook for GSAP ScrollTrigger animations
 * Handles registration, context setup, and cleanup
 *
 * @param {React.RefObject} sectionRef - Reference to the section element
 * @param {Array} dependencies - Dependency array for the effect (required)
 * @param {Function} setup - Setup function that creates GSAP animations (should be stable via useCallback)
 */
export const useGsapScroll = (sectionRef, dependencies, setup) => {
  useEffect(() => {
    // Dev-mode warning for missing dependencies
    if (process.env.NODE_ENV === 'development') {
      if (!dependencies || dependencies.length === 0) {
        console.warn(
          '[useGsapScroll] No dependencies provided. If your setup function uses props or state, ' +
          'you may encounter stale closures. Wrap setup in useCallback and pass relevant dependencies.'
        );
      }
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Capture current ref for cleanup
    const currentSection = sectionRef.current;

    // Create GSAP context for scoped animations
    const ctx = gsap.context(() => {
      if (setup && typeof setup === 'function') {
        setup();
      }
    }, sectionRef);

    // Cleanup function
    return () => {
      // Revert all animations in this context
      ctx.revert();

      // Kill all ScrollTriggers associated with this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === currentSection) {
          trigger.kill();
        }
      });
    };
  }, [...dependencies, setup, sectionRef]);
};
