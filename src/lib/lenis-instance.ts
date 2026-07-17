import type Lenis from "lenis";

/**
 * Module-scope registry for the single active Lenis instance (owned by
 * MotionProvider). Lets in-page anchor navigation (AnchorLink) drive Lenis
 * directly instead of relying on a native anchor jump that Lenis clobbers
 * mid-animation while it lazily initializes (the launch-verification
 * "overview one click away" scroll race). Type-only Lenis import — no runtime
 * cost, so this stays out of the eager route bundle.
 */

let activeLenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null): void {
  activeLenis = instance;
}

export function getActiveLenis(): Lenis | null {
  return activeLenis;
}
