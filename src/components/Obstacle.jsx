import { RigidBody } from '@react-three/rapier';

export default function Obstacle({ position }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} name="obstacle">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}