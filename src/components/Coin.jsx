import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';

export default function Coin({ id, position, collected, onCollect }) {
  const meshRef = useRef(null);
  const baseYRef = useRef(position[1]);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y =
        baseYRef.current + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <RigidBody
      type="fixed"
      colliders="hull"
      position={position}
      sensor
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === 'player') {
          onCollect(id);
        }
      }}
    >
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>
  );
}