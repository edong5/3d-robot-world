import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

import { RobotActor } from './RobotActor';
import { CONTROLS_CONFIG } from '../config/controls';

let audioContext;
const audioBufferCache = new Map();

function playSound(url) {
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const playFromBuffer = (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    };

    const cached = audioBufferCache.get(url);
    if (cached) {
      playFromBuffer(cached);
      return;
    }

    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        audioBufferCache.set(url, audioBuffer);
        playFromBuffer(audioBuffer);
      })
      .catch(() => {});
  } catch {
    // ignore audio failures
  }
}

export default function PhysicsPlayer({ controller, actorRef, baseState, speedRef }) {
  const rigidBodyRef = useRef(null);
  const { rapier, world } = useRapier();

  const moveDir = useMemo(() => new THREE.Vector3(), []);
  const currentSpeedRef = useRef(0);
  const groundContactsRef = useRef(0);
  const lastBumpAtRef = useRef(0);
  const internalJumpStateRef = useRef(false);

  const rayOrigin = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useFrame((_, delta) => {
    const actor = actorRef.current;
    const body = rigidBodyRef.current;
    if (!actor || !body) return;

    const dt = Math.min(delta, 0.1);
    const move = controller.moveRef.current;

    const currentVel = body.linvel();
    const p = body.translation();

    rayOrigin.set(p.x, p.y + 0.1, p.z);
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, 0.3, true);

    const isGrounded =
      (hit !== null || groundContactsRef.current > 0) &&
      Math.abs(currentVel.y) < 0.2;

    const turnInput = (move.left ? 1 : 0) + (move.right ? -1 : 0);
    actor.rotation.y += turnInput * CONTROLS_CONFIG.rotationSpeed * dt;

    const forwardInput = (move.forward ? 1 : 0) + (move.backward ? -1 : 0);
    const moving = forwardInput !== 0;

    if (moving) {
      const targetSpeed =
        CONTROLS_CONFIG.moveBaseSpeed *
        (controller.runModeRef.current
          ? CONTROLS_CONFIG.runFactor
          : CONTROLS_CONFIG.walkFactor);

      const accel =
        targetSpeed !== 0
          ? CONTROLS_CONFIG.acceleration
          : CONTROLS_CONFIG.deceleration;

      currentSpeedRef.current = THREE.MathUtils.lerp(
        currentSpeedRef.current,
        targetSpeed,
        dt * accel
      );

      moveDir.set(Math.sin(actor.rotation.y), 0, Math.cos(actor.rotation.y));
      moveDir.multiplyScalar(forwardInput * currentSpeedRef.current);

      body.setLinvel({ x: moveDir.x, y: currentVel.y, z: moveDir.z }, true);
    } else {
      currentSpeedRef.current = THREE.MathUtils.lerp(
        currentSpeedRef.current,
        0,
        dt * CONTROLS_CONFIG.deceleration
      );
      body.setLinvel(
        { x: currentVel.x * 0.85, y: currentVel.y, z: currentVel.z * 0.85 },
        true
      );
    }

    const bounds = CONTROLS_CONFIG.boundaries;
    const clampedX = Math.min(bounds.maxX, Math.max(bounds.minX, p.x));
    const clampedZ = Math.min(bounds.maxZ, Math.max(bounds.minZ, p.z));

    if (clampedX !== p.x || clampedZ !== p.z) {
      body.setTranslation({ x: clampedX, y: p.y, z: clampedZ }, true);
      const v = body.linvel();
      body.setLinvel({ x: 0, y: v.y, z: 0 }, true);
    }

    if (speedRef) {
      const v = body.linvel();
      speedRef.current = Math.sqrt(v.x * v.x + v.z * v.z);
    }

    if (controller.consumeJump()) {
      if (isGrounded) {
        body.wakeUp();

        if (typeof body.applyImpulse === 'function') {
          body.applyImpulse(
            { x: 0, y: CONTROLS_CONFIG.jumpVelocityY * body.mass(), z: 0 },
            true
          );
        } else {
          body.setLinvel(
            { x: currentVel.x, y: CONTROLS_CONFIG.jumpVelocityY, z: currentVel.z },
            true
          );
        }
      }
    }

    const freshVelY = body.linvel().y;
    internalJumpStateRef.current = !isGrounded && freshVelY > 0.5;
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
      name="player"
      onCollisionEnter={(e) => {
        const otherName = e.other.rigidBodyObject?.name;

        if (otherName === 'ground' && e.contact?.normal?.y > 0.5) {
          groundContactsRef.current += 1;
        }

        if (otherName === 'obstacle') {
          const now = performance.now();
          if (now - lastBumpAtRef.current > 120) {
            lastBumpAtRef.current = now;
            playSound('/sounds/bump.wav');
          }
        }
      }}
      onCollisionExit={(e) => {
        const otherName = e.other.rigidBodyObject?.name;
        if (otherName === 'ground') {
          groundContactsRef.current = Math.max(0, groundContactsRef.current - 1);
        }
      }}
    >
      <CylinderCollider args={[0.8, 0.4]} position={[0, 0.8, 0]} />
      <RobotActor
        ref={actorRef}
        baseState={baseState}
        emote={controller.emote}
        expression={controller.expression}
        internalJumpStateRef={internalJumpStateRef}
      />
    </RigidBody>
  );
}