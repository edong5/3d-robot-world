import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const RobotActor = forwardRef(function RobotActor(
  { baseState = 'Walking', emote = null, expression = null, internalJumpStateRef },
  ref
) {
  const group = useRef();
  const { scene, nodes, animations } = useGLTF('/models/robot.glb');
  const { actions } = useAnimations(animations, group);

  useImperativeHandle(ref, () => group.current, []);

  const [effectiveState, setEffectiveState] = useState(baseState);

  const oneShot = useMemo(
    () => new Set(['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp', 'Death', 'Sitting', 'Standing']),
    []
  );

  const activeActionRef = useRef(null);
  const previousActionRef = useRef(null);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    Object.keys(actions).forEach((key) => {
      const action = actions[key];
      if (!action) return;
      if (oneShot.has(key)) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      } else {
        action.clampWhenFinished = false;
        action.loop = THREE.LoopRepeat;
      }
    });
  }, [actions, oneShot]);

  const fadeToAction = (name, duration) => {
    const next = actions[name];
    if (!next) return;

    previousActionRef.current = activeActionRef.current;
    activeActionRef.current = next;

    if (previousActionRef.current && previousActionRef.current !== next) {
      previousActionRef.current.fadeOut(duration);
    }

    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
  };

  useEffect(() => {
    if (!actions) return;
    fadeToAction(effectiveState, 0.5);
  }, [effectiveState, actions]);

  useEffect(() => {
    if (!emote?.name) return;
    if (!actions) return;
    const mixer = actions[emote.name]?.getMixer?.();
    if (!mixer) {
      fadeToAction(emote.name, 0.2);
      return;
    }

    const onFinished = () => {
      mixer.removeEventListener('finished', onFinished);
      fadeToAction(baseState, 0.2);
    };

    fadeToAction(emote.name, 0.2);
    mixer.addEventListener('finished', onFinished);

    return () => {
      mixer.removeEventListener('finished', onFinished);
    };
  }, [emote?.nonce, emote?.name, actions, baseState]);

  useEffect(() => {
    const head = nodes.Head_4 || scene?.getObjectByName?.('Head_4');
    if (!head?.morphTargetDictionary || !head?.morphTargetInfluences) return;
    const dict = head.morphTargetDictionary;
    head.userData.targetMorphWeights ||= {};
    Object.keys(dict).forEach((key) => {
      const idx = dict[key];
      head.userData.targetMorphWeights[idx] = key.toLowerCase() === expression?.toLowerCase() ? 1 : 0;
    });
  }, [expression, nodes, scene]);

  useFrame((_, delta) => {
    // Handle jump state override from physics
    if (internalJumpStateRef) {
      if (internalJumpStateRef.current && effectiveState !== 'Jump') {
        setEffectiveState('Jump');
      } else if (!internalJumpStateRef.current && effectiveState === 'Jump') {
        setEffectiveState(baseState);
      } else if (!internalJumpStateRef.current && effectiveState !== baseState) {
        // Sync back to baseState if not jumping and mismatch
        setEffectiveState(baseState);
      }
    } else {
      if (effectiveState !== baseState) setEffectiveState(baseState);
    }

    const head = nodes.Head_4 || scene?.getObjectByName?.('Head_4');
    if (head && head.morphTargetInfluences && head.userData.targetMorphWeights) {
      for (const [index, targetWeight] of Object.entries(head.userData.targetMorphWeights)) {
        const currentWeight = head.morphTargetInfluences[index];
        head.morphTargetInfluences[index] = THREE.MathUtils.lerp(currentWeight, targetWeight, delta * 10);
      }
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
});

useGLTF.preload('/models/robot.glb');
