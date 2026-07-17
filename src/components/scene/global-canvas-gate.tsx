"use client";

import type React from "react";
import dynamic from "next/dynamic";

const GlobalCanvas = dynamic(() => import("./global-canvas"), {
  ssr: false,
});

/**
 * Gate wrapper to dynamically load the WebGL GlobalCanvas on the client side.
 * Moves the ssr:false boundary out of layout.tsx (Server Component) to comply
 * with Next.js Turbopack constraints.
 */
export function GlobalCanvasGate() {
  return <GlobalCanvas />;
}
