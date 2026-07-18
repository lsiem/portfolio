"use client";

import type React from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { getMotionToken } from "@/lib/motion-tokens";
import { sceneBridge } from "@/components/scene/scene-bridge";

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
 *
 * Kontinuum OUT beat (Phase-5 WP-D, DESIGN-SPEC §4): the crossfade additionally
 * announces itself on the one-way D-08 bridge (`bridge.transition`), so the
 * persistent particle field scatters in sync with the DOM fade. Without a
 * mounted canvas the writes are dead letters (`invalidate` is a module-level
 * no-op) — tier "none" / `?webgl=off` / context-lost behavior stays
 * byte-identical to today. Reduced-motion and modifier-click paths untouched.
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
        // Watchdog already navigated (import stalled >700ms): starting the
        // tween now would scatter the field mid-IN — skip; the conductor and
        // its 900ms stale sweep own the field from here.
        if (committed) return;
        sceneBridge.transition = {
          phase: "out",
          t: 0,
          startedAt: performance.now(),
        };
        const tween = gsap.to(main, {
          opacity: 0,
          y: -getMotionToken("--motion-distance-md"),
          // Hard 300ms OUT cap (§4): quicker than --motion-duration-base wins.
          duration: Math.min(
            getMotionToken("--motion-duration-base"),
            OUT_CAP_S,
          ),
          ease: "power2.inOut", // named equivalent of --motion-ease-in-out
          onUpdate: () => {
            sceneBridge.transition.t = tween.progress();
            sceneBridge.invalidate();
          },
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
