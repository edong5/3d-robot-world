import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useRobotController() {
  const states = useMemo(
    () => ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'],
    []
  );
  const emotes = useMemo(() => ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'], []);
  const expressions = useMemo(() => ['Angry', 'Happy', 'Sad', 'Surprised'], []);

  const [baseState, setBaseState] = useState('Idle');
  const [locomotionState, setLocomotionState] = useState('Idle');
  const [expression, setExpression] = useState(null);
  const [emoteName, setEmoteName] = useState(null);
  const [emoteNonce, setEmoteNonce] = useState(0);

  const [isRunMode, setIsRunMode] = useState(false);

  const moveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  // Track run mode purely via ref for fast useFrame access
  const runModeRef = useRef(false);
  useEffect(() => {
    runModeRef.current = isRunMode;
  }, [isRunMode]);

  const updateLocomotion = useCallback(() => {
    const m = moveRef.current;
    const moving = m.forward || m.backward;
    if (!moving) {
      setLocomotionState('Idle');
      return;
    }
    setLocomotionState(runModeRef.current ? 'Running' : 'Walking');
  }, []);

  const requestJump = useCallback(() => {
    moveRef.current.jump = true;
    console.log('[Jump] 监听到空格/跳跃请求');
  }, []);

  // Use refs for callbacks to avoid re-binding event listeners on every locomotion update
  const updateLocomotionRef = useRef(updateLocomotion);
  useEffect(() => {
    updateLocomotionRef.current = updateLocomotion;
  }, [updateLocomotion]);

  const bindKeyListeners = useCallback(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w') moveRef.current.forward = true;
      if (k === 's') moveRef.current.backward = true;
      if (k === 'a') moveRef.current.left = true;
      if (k === 'd') moveRef.current.right = true;
      
      if (e.code === 'Space' || k === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) requestJump();
      }

      // Toggle Run/Walk on Shift
      if (k === 'shift') {
        if (!e.repeat) {
          setIsRunMode(prev => {
            const next = !prev;
            runModeRef.current = next;
            updateLocomotionRef.current();
            return next;
          });
        }
      }

      if (k === '1') setBaseState('Idle');
      if (k === '2') setBaseState('Walking');
      if (k === '3') setBaseState('Running');
      if (k === '4') setBaseState('Dance');
      if (k === '5') setBaseState('Standing');

      updateLocomotionRef.current();
    };

    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w') moveRef.current.forward = false;
      if (k === 's') moveRef.current.backward = false;
      if (k === 'a') moveRef.current.left = false;
      if (k === 'd') moveRef.current.right = false;

      updateLocomotionRef.current();
    };

    window.addEventListener('keydown', down, { capture: true });
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down, { capture: true });
      window.removeEventListener('keyup', up);
    };
  }, [requestJump]);

  useEffect(() => bindKeyListeners(), [bindKeyListeners]);

  const triggerEmote = useCallback((name) => {
    if (!name) return;
    setEmoteName(name);
    setEmoteNonce((n) => n + 1);
  }, []);

  const setMove = useCallback((partial) => {
    Object.assign(moveRef.current, partial);
    updateLocomotion();
  }, [updateLocomotion]);

  const consumeJump = useCallback(() => {
    if (!moveRef.current.jump) return false;
    moveRef.current.jump = false;
    return true;
  }, []);

  return {
    states,
    emotes,
    expressions,
    baseState,
    setBaseState,
    locomotionState,
    expression,
    setExpression,
    emote: emoteName ? { name: emoteName, nonce: emoteNonce } : null,
    triggerEmote,
    moveRef,
    setMove,
    consumeJump,
    requestJump,
    isRunMode,
    runModeRef,
  };
}

