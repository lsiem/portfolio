"use client";

import type React from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Constellation } from "../constellation";
import { Text3D } from "../components/text-3d";
import { useScene } from "../scene-context";

export function HomeScene() {
  const { data } = useScene();
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    // Subtle float animation for the titles in 3D depth
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.08;
    }
  });

  return (
    <group>
      {/* Background WebGL constellation */}
      <Constellation tier="desktop" />

      {/* Interactive 3D Headings */}
      <group ref={groupRef}>
        <Text3D
          fontType="display"
          fontSize={0.7}
          colorType="foreground"
          maxWidth={8}
          textAlign="center"
          position={[0, 1.0, 0]}
        >
          {data.contact?.name || "Lasse Siemoneit"}
        </Text3D>

        <Text3D
          fontType="sans"
          fontSize={0.24}
          colorType="muted"
          maxWidth={6}
          textAlign="center"
          position={[0, 0.1, 0]}
          lineHeight={1.4}
        >
          {data.contact?.valueProp || "Building high-performance, accessible, and immersive web systems."}
        </Text3D>
      </group>
    </group>
  );
}
