"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScene } from "./scene-context";
import { sceneNavigation } from "./navigation-store";
import { HomeScene } from "./scenes/home-scene";
import { CareerScene } from "./scenes/career-scene";
import { ProjectsScene } from "./scenes/projects-scene";
import { DetailScene } from "./scenes/detail-scene";

function SceneCoordinator() {
  const { pathname } = useScene();
  const [target, setTarget] = useState(sceneNavigation.state);

  useEffect(() => {
    // Listen to changes in navigation coordinate targets
    return sceneNavigation.subscribe(() => {
      setTarget(sceneNavigation.state);
    });
  }, []);

  // Smoothly lerp camera position and Y-rotation
  useFrame((state) => {
    const t = sceneNavigation.state;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, t.targetX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, t.targetY, 0.08);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, t.targetZ, 0.08);
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, t.targetRotY, 0.08);
  });

  const isHome = useMemo(() => {
    let cleanPath = pathname;
    if (cleanPath.startsWith("/de")) cleanPath = cleanPath.slice(3);
    else if (cleanPath.startsWith("/en")) cleanPath = cleanPath.slice(3);
    return !cleanPath || cleanPath === "/";
  }, [pathname]);

  return (
    <group>
      {/* Home scene renders constellation in background and main headings */}
      {isHome && (
        <group>
          <HomeScene />
          
          {/* Scroll panned sections below the fold on home page */}
          <group position={[0, -6.5, 0]}>
            <CareerScene />
          </group>

          <group position={[0, -15.5, 0]}>
            <ProjectsScene />
          </group>
        </group>
      )}
      
      {/* Prose and Case Studies render dynamically at their target coordinate centers */}
      {!isHome && (
        <group position={[target.targetX, target.targetY, 0]}>
          <DetailScene />
        </group>
      )}
    </group>
  );
}

export default function GlobalCanvas() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-[#0a0a0a]">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8], fov: 45 }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SceneCoordinator />
      </Canvas>
    </div>
  );
}
