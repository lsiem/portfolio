"use client";

import type React from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
 * it at all. Reduced-motion and modifier-click paths swap instantly.
 */

/** OUT is hard-capped at 300ms (§4) — navigation is never hostage to spectacle. */
const OUT_CAP_S = 0.3;
/**
 * Navigation watchdog (§4, Vitrine graft): commit `router.push` at latest this
 * long after the click, even if the gsap import stalls or the tween is starved
 * — the out-state can never strand the visitor on the outgoing page.
 */
const NAV_WATCHDOG_MS = 700;

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
  // Locale-unprefixed, same shape as `href` (both flow through the
  // @/i18n/navigation wrappers) — the same-path guard below compares like
  // with like.
  const pathname = usePathname();

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

    // Same-path click: router.push(href) would no-op, so the OUT fade would
    // strand <main> invisible at opacity 0 — bail before the tween.
    // preventDefault keeps the Link's own same-route re-push from
    // resetting scroll; the click is simply inert.
    if (href === pathname) {
      event.preventDefault();
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

    // Single commit point, guarded — onComplete, the watchdog, and the import
    // failure path all funnel here; only the first caller navigates.
    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      router.push(href);
    };
    window.setTimeout(commit, NAV_WATCHDOG_MS);

    void import("gsap")
      .then(({ gsap }) => {
        // Watchdog already navigated (import stalled >700ms): skip the tween.
        if (committed) return;
        gsap.to(main, {
          opacity: 0,
          y: -getMotionToken("--motion-distance-md"),
          // Hard 300ms OUT cap: quicker than --motion-duration-base wins.
          duration: Math.min(
            getMotionToken("--motion-duration-base"),
            OUT_CAP_S,
          ),
          ease: "power2.inOut", // named equivalent of --motion-ease-in-out
          onComplete: commit,
        });
      })
      .catch(commit);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
