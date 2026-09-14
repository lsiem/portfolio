import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

/**
 * Adds restrained scroll depth to explicitly decorative nodes. It runs inside
 * MotionProvider's existing fine-pointer/reduced-motion gate, so content never
 * moves on touch or reduced-motion paths.
 */
export function initDecorativeParallax(
  gsap: typeof Gsap,
  ScrollTrigger: typeof ScrollTriggerType,
): () => void {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("[data-parallax]"),
  );
  const context = gsap.context(() => {
    for (const element of elements) {
      const amount = Number(element.dataset.parallax ?? 12);
      gsap.fromTo(
        element,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: element.closest("section") ?? element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }
  });
  ScrollTrigger.refresh();
  return () => context.revert();
}
