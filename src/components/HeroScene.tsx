"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshBasicMaterial color="#00D4AA" wireframe transparent opacity={0.25} />
    </mesh>
  );
}

function RotatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2.4, 0.04, 16, 100]} />
      <meshBasicMaterial color="#00D4AA" transparent opacity={0.4} />
    </mesh>
  );
}

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 1.5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent size={0.025} color="#00D4AA" sizeAttenuation />
    </Points>
  );
}

function SecondTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.x = -state.clock.elapsedTime * 0.15;
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[3.2, 0.02, 16, 80]} />
      <meshBasicMaterial color="#00E5FF" transparent opacity={0.2} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.5} />
        <FloatingSphere />
        <RotatingTorus />
        <SecondTorus />
        <ParticleCloud />
      </Canvas>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "200px",
          background: "linear-gradient(to top, #020814 0%, transparent 100%)",
        }}
      />
    </div>
  );
}