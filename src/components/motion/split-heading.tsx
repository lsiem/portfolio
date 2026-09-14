"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import type { SplitText } from "gsap/SplitText";
import { getMotionToken } from "@/lib/motion-tokens";
import { useFinePointerMotion } from "@/components/motion/use-motion-gates";

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
  const motionEnabled = useFinePointerMotion();

  useEffect(() => {
    if (!motionEnabled) return;
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    let context: { revert: () => void } | undefined;
    let split: SplitText | undefined;

    void (async () => {
      const [{ gsap }, splitModule] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      if (cancelled) return;

      const SplitTextRuntime = splitModule.SplitText;
      gsap.registerPlugin(SplitTextRuntime);
      await document.fonts.ready;
      if (cancelled || !ref.current) return;

      context = gsap.context(() => {
        split = SplitTextRuntime.create(element, { type: "words" });
        gsap.from(split.words, {
          yPercent: 100,
          duration: getMotionToken("--motion-duration-base"),
          stagger: getMotionToken("--motion-stagger-word"),
          ease: "expo.out",
        });
      }, element);
    })();

    return () => {
      cancelled = true;
      split?.revert();
      context?.revert();
    };
  }, [motionEnabled]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
