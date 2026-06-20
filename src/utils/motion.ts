const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function getMotionSafeDuration(defaultMs: number, reducedMs = 0): number {
  return prefersReducedMotion() ? reducedMs : defaultMs;
}

export function shouldUseLenis(): boolean {
  return !prefersReducedMotion();
}

export function subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = () => callback(media.matches);
  media.addEventListener('change', handler);
  return () => media.removeEventListener('change', handler);
}

export { REDUCED_MOTION_QUERY };
