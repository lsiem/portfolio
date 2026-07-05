"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { getMotionToken } from "@/lib/motion-tokens";

gsap.registerPlugin(SplitText);

/**
 * Reusable SplitText headline primitive (D-11.2) for plans 02-04 (case-study
 * H1s, standalone headline beats). Renders its children as a real DOM heading;
 * the split runs inside document.fonts.ready so word/char boundaries are
 * measured against the loaded Bricolage display metrics, not the fallback face
 * (round-2 LOW, Gemini). SplitText v3.13+ ships built-in aria-label/aria-hidden
 * so the real text stays announced underneath.
 *
 * NEVER pass a heading containing an interactive <a> — aria-hidden on the split
 * fragments would remove the link from the a11y tree (RESEARCH Pattern 4
 * nested-link trap). The hero H1 is plain text and safe (but the hero uses
 * HeroIntro's own timeline, not this primitive — single split owner).
 */
type SplitHeadingProps = {
  children: React.ReactNode;
  className?: string;
  /** heading level to render; defaults to h2 */
  as?: "h1" | "h2" | "h3";
};

export function SplitHeading({
  children,
  className,
  as: Tag = "h2",
}: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const dur = getMotionToken("--motion-duration-base");
      const stg = getMotionToken("--motion-stagger-word");

      const mm = gsap.matchMedia();
      let split: SplitText | undefined;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Wait for the display face so word boundaries measure against Bricolage.
        void document.fonts.ready.then(() => {
          if (!ref.current) return;
          split = SplitText.create(el, { type: "words" });
          gsap.from(split.words, {
            opacity: 0,
            yPercent: 100,
            duration: dur,
            stagger: stg,
            ease: "expo.out",
          });
        });
      });

      // Reduced-motion branch intentionally creates no SplitText — the heading
      // renders at its final state (real DOM text).

      return () => {
        split?.revert();
        mm.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
