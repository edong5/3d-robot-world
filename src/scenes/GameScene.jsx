import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Physics } from '@react-three/rapier'

import { GeoWorld } from '../scenes/GeoWorld'
import { CONTROLS_CONFIG } from '../config/controls'

import Obstacle from '../components/Obstacle'
import Coin from '../components/Coin'
import PhysicsPlayer from '../components/PhysicsPlayer'

export default function GameScene({
  controller,
  setHudDebug,
  coinPositions,
  coinCollected,
  onCoinCollect
}) {
  const actorRef = useRef(null)
  const orbitRef = useRef(null)

  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const speedRef = useRef(0)

  const effectiveBaseState =
    controller.locomotionState !== 'Idle'
      ? controller.locomotionState
      : controller.baseState

  // 🎥 相机跟随
  useFrame((_, dt) => {
    if (orbitRef.current && actorRef.current) {
      actorRef.current.getWorldPosition(targetPos)
      targetPos.y += CONTROLS_CONFIG.camera.targetHeightOffset

      orbitRef.current.target.lerp(targetPos, Math.min(dt, 0.1) * 10)
      orbitRef.current.update()
    }
  })

  // 🧭 Debug HUD
  useEffect(() => {
    const interval = setInterval(() => {
      if (actorRef.current) {
        actorRef.current.getWorldPosition(worldPos)

        setHudDebug({
          pos: `${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)}`,
          rot: `${(actorRef.current.rotation.y * (180 / Math.PI)).toFixed(1)}°`,
          speed: `${speedRef.current.toFixed(2)} u/s`,
        })
      }
    }, 200)

    return () => clearInterval(interval)
  }, [setHudDebug, worldPos])

  return (
    <>
      <Physics gravity={[0, CONTROLS_CONFIG.gravity, 0]}>
        <GeoWorld />

        <PhysicsPlayer
          controller={controller}
          actorRef={actorRef}
          baseState={effectiveBaseState}
          speedRef={speedRef}
        />

        {/* 障碍物 */}
        <Obstacle position={[5, 0.5, -5]} />
        <Obstacle position={[-6, 0.5, 2]} />
        <Obstacle position={[2, 0.5, 8]} />

        {/* 金币 */}
        {coinPositions.map((pos, idx) => (
          <Coin
            key={idx}
            id={idx}
            position={pos}
            collected={coinCollected[idx]}
            onCollect={onCoinCollect}
          />
        ))}
      </Physics>

      {/* 视角控制 */}
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={CONTROLS_CONFIG.camera.dampingFactor}
        minDistance={CONTROLS_CONFIG.camera.minDistance}
        maxDistance={CONTROLS_CONFIG.camera.maxDistance}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  )
}