"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Link, useRouter } from "@/i18n/navigation";
import { getMotionToken } from "@/lib/motion-tokens";

/**
 * Seamless sub-route transition (D-11.4). An ENHANCED locale-aware anchor: it
 * renders the real `@/i18n/navigation` <Link> (true <a> with a resolved href,
 * focusable, keyboard-activatable, :focus-visible ring, crawlable) and layers a
 * GSAP crossfade on top via onClick — it is NOT a click-only <button>/<div>.
 *
 * On a plain primary click it fades/slides the outgoing <main> out, then commits
 * navigation via the locale-aware router in onComplete. Under reduced-motion it
 * swaps instantly. Modifier and non-primary clicks (Cmd/Ctrl/Shift/Alt, middle,
 * right) pass through to native behavior so recruiters can open case studies in
 * new tabs. Single engine only — GSAP, never the View Transitions API (D-08).
 */
type TransitionLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function TransitionLink({
  href,
  className,
  children,
}: TransitionLinkProps) {
  const router = useRouter();
  const { contextSafe } = useGSAP();

  const handleClick = contextSafe(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Passthrough: let the browser handle modified / non-primary clicks
      // (open-in-new-tab etc.) — mandatory early return (finding #3).
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const main = document.querySelector("main");

      // Reduced-motion (or no <main> to animate): instant swap, no crossfade.
      if (reduceMotion || !main) {
        router.push(href);
        return;
      }

      gsap.to(main, {
        opacity: 0,
        y: -getMotionToken("--motion-distance-md"),
        duration: getMotionToken("--motion-duration-base"),
        ease: "power2.inOut", // named equivalent of --motion-ease-in-out
        onComplete: () => router.push(href),
      });
    },
  );

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
