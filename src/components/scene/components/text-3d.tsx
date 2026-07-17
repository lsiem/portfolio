"use client";

import type React from "react";
import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { resolveSceneColors } from "@/lib/theme-color-resolver";

type Text3DProps = {
  children: string;
  position?: [number, number, number];
  colorType?: "foreground" | "accent" | "muted" | "border";
  fontType?: "display" | "sans";
  fontSize?: number;
  maxWidth?: number;
  textAlign?: "left" | "right" | "center" | "justify";
  anchorX?: "left" | "center" | "right" | number;
  anchorY?: "top" | "middle" | "bottom" | number;
  letterSpacing?: number;
  lineHeight?: number;
};

export function Text3D({
  children,
  position = [0, 0, 0],
  colorType = "foreground",
  fontType = "sans",
  fontSize = 0.5,
  maxWidth,
  textAlign = "left",
  anchorX = "center",
  anchorY = "middle",
  letterSpacing = 0,
  lineHeight = 1.2,
}: Text3DProps) {
  const colors = useMemo(() => resolveSceneColors(), []);

  const colorStr = useMemo(() => {
    const c = colors[colorType];
    // Convert THREE.Color to css hex string
    return `#${c.getHexString()}`;
  }, [colors, colorType]);

  const fontPath = useMemo(() => {
    // If it's a display font, point to our Bricolage woff2 asset.
    // Drei's Text component handles loading woff2.
    if (fontType === "display") {
      return "/fonts/bricolage-grotesque-subset-700.woff2";
    }
    // Default Roboto for standard sans-serif
    return undefined;
  }, [fontType]);

  return (
    <Text
      position={position}
      color={colorStr}
      font={fontPath}
      fontSize={fontSize}
      maxWidth={maxWidth}
      textAlign={textAlign}
      anchorX={anchorX}
      anchorY={anchorY}
      letterSpacing={letterSpacing}
      lineHeight={lineHeight}
      material-depthWrite={false}
    >
      {children}
    </Text>
  );
}
