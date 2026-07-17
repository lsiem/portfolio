"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text3D } from "../components/text-3d";
import { useScene } from "../scene-context";

export function DetailScene() {
  const { data } = useScene();
  const page = data.activeCaseStudy || data.activeProsePage;
  const groupRef = useRef<THREE.Group>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetY = scrollY * 0.005;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    );
  });

  if (!page) return null;

  const title = page.title || "Detail Page";
  
  // Extract text fields for rendering. If MDX code is supplied, use description/summary.
  const bodyText = page.summary || page.description || "";
  const stack = page.stack ? `Stack: ${page.stack.join(", ")}` : "";

  return (
    <group ref={groupRef}>
      {/* Title */}
      <Text3D
        fontType="display"
        fontSize={0.42}
        colorType="foreground"
        position={[0, 2.5, 0]}
        maxWidth={6}
        textAlign="center"
      >
        {title}
      </Text3D>

      {/* Meta Specs */}
      {page.period ? (
        <group position={[0, 1.8, 0]}>
          <Text3D
            fontType="sans"
            fontSize={0.14}
            colorType="accent"
            position={[0, 0, 0]}
            textAlign="center"
          >
            {`${page.role} · ${page.period}`}
          </Text3D>
          {stack ? (
            <Text3D
              fontType="sans"
              fontSize={0.12}
              colorType="muted"
              position={[0, -0.25, 0]}
              textAlign="center"
              maxWidth={5.5}
            >
              {stack}
            </Text3D>
          ) : null}
        </group>
      ) : null}

      {/* Body content */}
      <Text3D
        fontType="sans"
        fontSize={0.16}
        colorType="foreground"
        position={[0, 1.1, 0]}
        maxWidth={5.5}
        textAlign="left"
        lineHeight={1.6}
        anchorY="top"
      >
        {bodyText}
      </Text3D>
    </group>
  );
}
