"use client";

import { useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { getMotionToken } from "@/lib/motion-tokens";

// Gate via useSyncExternalStore (repo lint convention — no setState-in-effect).
// Magnetic pull is a pointer-only affordance (D-11.1): absent, not degraded, on
// touch/keyboard (D-19), and stripped under prefers-reduced-motion (MODE-02).
function subscribeMagneticGates(callback: () => void): () => void {
  const coarse = window.matchMedia("(pointer: coarse)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  coarse.addEventListener("change", callback);
  reduced.addEventListener("change", callback);
  return () => {
    coarse.removeEventListener("change", callback);
    reduced.removeEventListener("change", callback);
  };
}

function getMagneticEnabledSnapshot(): boolean {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

const MAX_PULL_PX = 12; // clamp displacement (UI-SPEC D-11.1)
const PULL_FACTOR = 0.3;

/**
 * Pointer-only magnetic pull wrapper (D-11.1). The wrapped element eases toward
 * the cursor within a small radius on pointer:fine devices and snaps back on
 * leave. NO touch handlers are ever attached (D-19: absent, not degraded), and
 * keyboard focus is unaffected — the global :focus-visible ring still applies.
 *
 * Structural stability (finding #3): the wrapper element (an inline-block span,
 * layout-neutral around inline/inline-flex targets) is ALWAYS rendered in both
 * gate states; only the mousemove/mouseleave listeners are conditionally bound.
 * The element type never changes with the gate, so a pointer-type flip never
 * remounts the wrapped control. The pull is gated OFF under
 * prefers-reduced-motion (MODE-02) as well as on touch (D-19).
 */
type MagneticProps = {
  children: React.ReactNode;
  className?: string;
};

export function Magnetic({ children, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const magneticEnabled = useSyncExternalStore(
    subscribeMagneticGates,
    getMagneticEnabledSnapshot,
    getServerSnapshot,
  );

  // useGSAP scopes the tweens to this element and cleans them up on unmount;
  // contextSafe makes tweens created inside event handlers context-tracked.
  const { contextSafe } = useGSAP({ scope: ref });

  // Handlers read the element via event.currentTarget (the bound span), never
  // ref.current — the React-Compiler lint forbids ref access in render-created
  // closures. The ref is used only for useGSAP's scope + attaching the element.
  const onMouseMove = contextSafe((event: React.MouseEvent<HTMLSpanElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    // --motion-ease-magnetic is a cubic-bezier token; GSAP core renders it via a
    // named equivalent (power2.out pull). Duration comes from the fast token.
    gsap.to(el, {
      x: gsap.utils.clamp(-MAX_PULL_PX, MAX_PULL_PX, relX * PULL_FACTOR),
      y: gsap.utils.clamp(-MAX_PULL_PX, MAX_PULL_PX, relY * PULL_FACTOR),
      duration: getMotionToken("--motion-duration-fast") * 2,
      ease: "power2.out",
    });
  });

  const onMouseLeave = contextSafe(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      gsap.to(event.currentTarget, {
        x: 0,
        y: 0,
        duration: getMotionToken("--motion-duration-base"),
        ease: "elastic.out(1, 0.4)",
      });
    },
  );

  return (
    <span
      ref={ref}
      className={`inline-block ${className ?? ""}`.trim()}
      onMouseMove={magneticEnabled ? onMouseMove : undefined}
      onMouseLeave={magneticEnabled ? onMouseLeave : undefined}
    >
      {children}
    </span>
  );
}
