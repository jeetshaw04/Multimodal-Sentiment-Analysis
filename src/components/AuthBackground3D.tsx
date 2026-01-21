import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const EntangledRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.15;
      ring1Ref.current.rotation.y += delta * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 0.12;
      ring2Ref.current.rotation.z += delta * 0.08;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.08;
      ring3Ref.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group position={[-2, 0, -3]}>
      {/* Ring 1 - Indigo */}
      <mesh ref={ring1Ref} rotation={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.7}
          roughness={0.3}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Ring 2 - Violet */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.7}
          roughness={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Ring 3 - Cyan */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, Math.PI / 4]}>
        <torusGeometry args={[2.5, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#22d3ee"
          metalness={0.7}
          roughness={0.3}
          emissive="#22d3ee"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

const AuthBackground3D = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <EntangledRings />
      </Canvas>
    </div>
  );
};

export default AuthBackground3D;
