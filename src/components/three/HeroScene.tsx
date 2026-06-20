import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh } from 'three';

function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = clock.elapsedTime * 0.22 + pointer.x * 0.4;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} scale={1.15}>
        <MeshDistortMaterial
          color="#22d3ee"
          attach="material"
          distort={0.35}
          speed={1.5}
          roughness={0.15}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#070f32']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 4]} intensity={1.2} />
      <AnimatedSphere />
    </Canvas>
  );
}
