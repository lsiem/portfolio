"use client";

import type React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { getMotionToken } from "@/lib/motion-tokens";

/**
 * Seamless sub-route transition (D-11.4). An ENHANCED locale-aware anchor: it
 * renders the real `@/i18n/navigation` <Link> (true <a> with a resolved href,
 * focusable, keyboard-activatable, :focus-visible ring, crawlable) and layers a
 * GSAP crossfade on top via onClick — it is NOT a click-only <button>/<div>.
 *
 * On a plain primary click it fades/slides the outgoing <main> out, then commits
 * navigation via the locale-aware router. Under reduced-motion it swaps instantly.
 * Modifier and non-primary clicks (Cmd/Ctrl/Shift/Alt, middle, right) pass
 * through to native behavior so recruiters can open case studies in new tabs.
 * Single engine only — GSAP, never the View Transitions API (D-08).
 *
 * JUST-IN-TIME gsap (CWV reconciliation, 03-04 Option A): gsap is dynamically
 * imported inside the click handler (after a synchronous preventDefault), never
 * via a static useGSAP import — so it stays out of the home route's eager bundle
 * and off Lighthouse's measured run. gsap is typically already cached by the time
 * a user clicks (reveals load it on scroll); the reduced-motion path never needs
 * it at all.
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

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

    // preventDefault MUST run synchronously before the async gsap import, or the
    // browser navigates before the crossfade can play.
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

    void import("gsap")
      .then(({ gsap }) => {
        gsap.to(main, {
          opacity: 0,
          y: -getMotionToken("--motion-distance-md"),
          duration: getMotionToken("--motion-duration-base"),
          ease: "power2.inOut", // named equivalent of --motion-ease-in-out
          onComplete: () => router.push(href),
        });
      })
      .catch(() => {
        router.push(href);
      });
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
