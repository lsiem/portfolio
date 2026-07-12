"use client";

import type { MouseEvent, ReactNode } from "react";
import { getActiveLenis } from "@/lib/lenis-instance";

/**
 * In-page hash-anchor link (e.g. the hero "overview" nav → #career). Renders a
 * real <a href="#…"> — SSR-visible, right-click/open-in-new-tab friendly, and a
 * correct fallback if JS never runs — but intercepts the primary click to scroll
 * deterministically.
 *
 * Why not a plain <a>: on the motion path, `html { scroll-behavior: smooth }`
 * starts a NATIVE smooth scroll on click, then Lenis (lazily imported) finishes
 * initializing, flips scroll-behavior to auto, and latches its target to the
 * current position — killing the in-flight scroll. A click in that ~sub-second
 * window became a dead click (launch-verification scroll race). Here we hand the
 * scroll to Lenis when it is ready, and otherwise reflect the hash in the URL so
 * MotionProvider re-syncs to it the moment Lenis initializes.
 *
 * Offset tracks the target's own `scroll-margin-top` (the sticky-header gap,
 * `scroll-mt-24`) read at click time — no duplicated magic number.
 */
interface AnchorLinkProps {
  href: `#${string}`;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export function AnchorLink({ href, className, children, ...rest }: AnchorLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    // Defer to the browser for modified/non-primary clicks (new tab, etc.).
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (!target) return; // no target yet — let the native anchor try

    event.preventDefault();

    // Reflect the anchor in the URL WITHOUT the browser's own jump (which would
    // fight Lenis) — replaceState updates the hash silently and gives
    // MotionProvider a target to re-sync to if Lenis is still initializing.
    history.replaceState(null, "", href);

    const scrollMargin =
      parseFloat(getComputedStyle(target).scrollMarginTop) || 0;

    const lenis = getActiveLenis();
    if (lenis) {
      lenis.scrollTo(target, { offset: -scrollMargin });
      return;
    }

    // No Lenis (reduced-motion / touch / not-yet-loaded): native scroll honors
    // scroll-margin-top and the page's scroll-behavior. The replaceState above
    // ensures a click during Lenis's load window is recovered, not clobbered.
    target.scrollIntoView();
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
