import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const TorusLoader = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.8;
      outerRef.current.rotation.y += delta * 0.4;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.6;
      innerRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Outer torus - Cyan */}
      <mesh ref={outerRef}>
        <torusGeometry args={[1.2, 0.12, 32, 100]} />
        <meshStandardMaterial
          color="#22d3ee"
          metalness={0.6}
          roughness={0.3}
          emissive="#22d3ee"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner torus - Purple */}
      <mesh ref={innerRef}>
        <torusGeometry args={[0.8, 0.1, 32, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.6}
          roughness={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

const LoadingState3D = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-48 h-48 mb-6">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />
          <TorusLoader />
        </Canvas>
      </div>
      <p className="text-muted-foreground text-lg animate-pulse">Analyzing sentiment...</p>
      <p className="text-muted-foreground/70 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
};

export default LoadingState3D;
