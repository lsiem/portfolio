"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOTION_ALLOWED_QUERY = "(prefers-reduced-motion: no-preference)";
const FINE_POINTER_QUERY = "(pointer: fine)";
const LARGE_VIEWPORT_QUERY = "(min-width: 1024px)";

function subscribeToQueries(
  queries: readonly string[],
  callback: () => void,
): () => void {
  const mediaQueries = queries.map((query) => window.matchMedia(query));
  for (const mediaQuery of mediaQueries) {
    mediaQuery.addEventListener("change", callback);
  }
  return () => {
    for (const mediaQuery of mediaQueries) {
      mediaQuery.removeEventListener("change", callback);
    }
  };
}

function motionDisabledServerSnapshot(): boolean {
  return false;
}

function subscribeMotionPreference(callback: () => void): () => void {
  return subscribeToQueries([REDUCED_MOTION_QUERY], callback);
}

function getMotionAllowedSnapshot(): boolean {
  return window.matchMedia(MOTION_ALLOWED_QUERY).matches;
}

function subscribeFinePointerMotion(callback: () => void): () => void {
  return subscribeToQueries(
    [REDUCED_MOTION_QUERY, FINE_POINTER_QUERY],
    callback,
  );
}

function getFinePointerMotionSnapshot(): boolean {
  return (
    getMotionAllowedSnapshot() && window.matchMedia(FINE_POINTER_QUERY).matches
  );
}

function subscribeLargeViewportMotion(callback: () => void): () => void {
  return subscribeToQueries(
    [REDUCED_MOTION_QUERY, LARGE_VIEWPORT_QUERY],
    callback,
  );
}

function getLargeViewportMotionSnapshot(): boolean {
  return (
    getMotionAllowedSnapshot() &&
    window.matchMedia(LARGE_VIEWPORT_QUERY).matches
  );
}

export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribeMotionPreference,
    getMotionAllowedSnapshot,
    motionDisabledServerSnapshot,
  );
}

export function useFinePointerMotion(): boolean {
  return useSyncExternalStore(
    subscribeFinePointerMotion,
    getFinePointerMotionSnapshot,
    motionDisabledServerSnapshot,
  );
}

export function useLargeViewportMotion(): boolean {
  return useSyncExternalStore(
    subscribeLargeViewportMotion,
    getLargeViewportMotionSnapshot,
    motionDisabledServerSnapshot,
  );
}
