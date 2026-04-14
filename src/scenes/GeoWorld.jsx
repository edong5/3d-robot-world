import React, { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function GeoWorld() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    g.material.opacity = 0.2;
    g.material.transparent = true;
    return g;
  }, []);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x8d8d8d} intensity={1} position={[0, 20, 0]} />
      <directionalLight
        position={[0, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Ground Physics */}
      <RigidBody type="fixed" position={[0, 0, 0]} colliders={false} name="ground">
        <CuboidCollider args={[1000, 0.1, 1000]} position={[0, -0.1, 0]} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[2000, 2000]} />
          <meshPhongMaterial color={0xcbcbcb} depthWrite={false} />
        </mesh>
      </RigidBody>

      <primitive object={grid} position={[0, 0.01, 0]} />

      <RigidBody type="fixed" colliders="cuboid" position={[2, 0.5, -2]} name="ground">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color={0x7a8aa0} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[-3, 1, 3]} name="ground">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color={0x9a7a7a} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 6]} rotation={[0, Math.PI / 6, 0]} name="ground">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 0.5, 2]} />
          <meshStandardMaterial color={0x6f8f6f} />
        </mesh>
      </RigidBody>
    </>
  );
}
