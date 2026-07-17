"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text3D } from "../components/text-3d";
import { useScene } from "../scene-context";

export function CareerScene() {
  const { data } = useScene();
  const careerEntries = data.career || [];
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
    // Map browser scroll to WebGL Y translation
    const targetY = scrollY * 0.005;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {/* Title */}
      <Text3D
        fontType="display"
        fontSize={0.45}
        colorType="accent"
        position={[0, 2.5, 0]}
      >
        Career Timeline
      </Text3D>

      {/* 3D Timeline spine line */}
      <mesh position={[-3, -4, -0.1]}>
        <boxGeometry args={[0.02, 12, 0.02]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.3} />
      </mesh>

      {/* Floating 3D timeline entries */}
      {careerEntries.map((entry: any, index: number) => {
        const yOffset = -index * 2.2;
        return (
          <group key={entry.slug} position={[0, yOffset, 0]}>
            {/* Timeline connector dot */}
            <mesh position={[-3, 0.4, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#fb923c" />
            </mesh>

            {/* Organization Name */}
            <Text3D
              fontType="display"
              fontSize={0.32}
              colorType="foreground"
              position={[-2.6, 0.4, 0]}
              anchorX="left"
            >
              {entry.org}
            </Text3D>

            {/* Date range */}
            <Text3D
              fontType="sans"
              fontSize={0.15}
              colorType="muted"
              position={[-2.6, 0.05, 0]}
              anchorX="left"
            >
              {`${entry.from.split("-")[0]} - ${entry.to ? entry.to.split("-")[0] : "Present"}`}
            </Text3D>

            {/* Roles list */}
            {entry.roles.map((role: any, rIdx: number) => (
              <group key={rIdx} position={[0, -0.35 - rIdx * 0.45, 0]}>
                <Text3D
                  fontType="sans"
                  fontSize={0.16}
                  colorType="foreground"
                  position={[-2.4, 0.1, 0]}
                  anchorX="left"
                >
                  {role.title}
                </Text3D>
                <Text3D
                  fontType="sans"
                  fontSize={0.13}
                  colorType="muted"
                  position={[-2.4, -0.1, 0]}
                  anchorX="left"
                  maxWidth={5}
                >
                  {role.description}
                </Text3D>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}
