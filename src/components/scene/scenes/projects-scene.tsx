"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text3D } from "../components/text-3d";
import { useScene } from "../scene-context";

interface ProjectCardProps {
  project: any;
  position: [number, number, number];
  isLarge: boolean;
}

function ProjectCard({ project, position, isLarge }: ProjectCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.05 : 1;
    const targetZ = hovered ? 0.35 : 0;
    
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15)
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      position[2] + targetZ,
      0.15
    );
  });

  const handleClick = () => {
    if (project.depth === "flagship" || project.depth === "deep") {
      router.push(`/case-studies/${project.slug}`);
    } else if (project.url) {
      window.open(project.url, "_blank");
    }
  };

  const cardWidth = isLarge ? 4.4 : 2.6;
  const cardHeight = 2.0;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* 3D background card plate */}
      <mesh>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshBasicMaterial
          color={hovered ? "#22c55e" : "#262626"} // highlights board in color on hover
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Card border frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[cardWidth + 0.05, cardHeight + 0.05]} />
        <meshBasicMaterial color={hovered ? "#fb923c" : "#404040"} transparent opacity={0.5} />
      </mesh>

      {/* Content layout relative to card center */}
      <group position={[-cardWidth / 2 + 0.25, 0, 0.01]}>
        {/* Title */}
        <Text3D
          fontType="display"
          fontSize={0.24}
          colorType="foreground"
          position={[0, 0.45, 0]}
          anchorX="left"
        >
          {project.title}
        </Text3D>

        {/* Summary Description */}
        <Text3D
          fontType="sans"
          fontSize={0.12}
          colorType="muted"
          position={[0, -0.05, 0]}
          anchorX="left"
          maxWidth={cardWidth - 0.5}
          lineHeight={1.4}
        >
          {project.summary}
        </Text3D>

        {/* Tags */}
        <Text3D
          fontType="sans"
          fontSize={0.10}
          colorType="accent"
          position={[0, -0.55, 0]}
          anchorX="left"
          maxWidth={cardWidth - 0.5}
        >
          {project.tags.slice(0, 3).join(" · ")}
        </Text3D>
      </group>
    </group>
  );
}

export function ProjectsScene() {
  const { data } = useScene();
  const projects = data.projects || [];

  return (
    <group>
      <Text3D
        fontType="display"
        fontSize={0.45}
        colorType="accent"
        position={[0, 2.5, 0]}
      >
        Featured Projects
      </Text3D>

      {projects.map((project: any, index: number) => {
        let pos: [number, number, number] = [0, 0, 0];
        let isLarge = false;

        // Display featured pair (index 0, 1) side by side on top row, standard below
        if (index === 0) {
          pos = [-2.4, 0.8, 0];
          isLarge = true;
        } else if (index === 1) {
          pos = [2.4, 0.8, 0];
          isLarge = true;
        } else {
          const stdIndex = index - 2;
          const xOffset = (stdIndex - 1) * 2.8;
          pos = [xOffset, -1.2, 0];
        }

        return (
          <ProjectCard
            key={project.slug}
            project={project}
            position={pos}
            isLarge={isLarge}
          />
        );
      })}
    </group>
  );
}
