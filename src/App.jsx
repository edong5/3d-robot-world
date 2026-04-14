import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import * as THREE from 'three';

import { useRobotController } from './hooks/useRobotController';
import { CONTROLS_CONFIG } from './config/controls';

import GameScene from './scenes/GameScene';
import { generateCoinPositions } from './systems/coinSystem';

// ----------------------------------------------------
// UI Components
// ----------------------------------------------------

function UIPanel({ controller, hud }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(255, 255, 255, 0.85)',
        padding: '12px',
        borderRadius: '10px',
        fontFamily: 'sans-serif',
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
        width: 230,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Robot Controls</div>

      {/* State */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, marginBottom: 6 }}>State</div>
        <select
          value={controller.baseState}
          onChange={(e) => controller.setBaseState(e.target.value)}
          style={{ width: '100%', padding: 6 }}
        >
          {controller.states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Expression */}
      <div>
        <div style={{ fontSize: 12, marginBottom: 6 }}>Expression</div>
        <select
          value={controller.expression || 'None'}
          onChange={(e) =>
            controller.setExpression(e.target.value === 'None' ? null : e.target.value)
          }
          style={{ width: '100%', padding: 6 }}
        >
          {['None', ...controller.expressions].map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Emotes */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 6 }}>Emotes</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {controller.emotes.map((e) => (
            <button
              key={e}
              onClick={() =>
                e === 'Jump'
                  ? controller.requestJump()
                  : controller.triggerEmote(e)
              }
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.15)',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Locomotion Mode */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 6 }}>Locomotion Mode</div>
        <div
          style={{
            padding: '6px 8px',
            borderRadius: 6,
            border: '1px solid rgba(0,0,0,0.15)',
            background: controller.isRunMode ? '#e3f2fd' : 'white',
            fontWeight: controller.isRunMode ? 'bold' : 'normal',
            textAlign: 'center',
          }}
        >
          {controller.isRunMode ? '奔跑 (Run)' : '慢走 (Walk)'}
        </div>
      </div>

      {/* HUD */}
      <div
        style={{
          marginTop: 14,
          fontSize: 11,
          color: '#444',
          borderTop: '1px solid #ddd',
          paddingTop: 8,
        }}
      >
        <strong>Coins:</strong> {hud.coins.collected}/{hud.coins.total}
        <br />
        <strong>Pos:</strong> {hud.debug.pos}
        <br />
        <strong>Rot:</strong> {hud.debug.rot}
        <br />
        <strong>Spd:</strong> {hud.debug.speed}
      </div>

      {/* Toast */}
      {hud.toast && (
        <div
          style={{
            marginTop: 12,
            padding: 8,
            background: '#ffeb3b',
            color: '#333',
            fontWeight: 'bold',
            borderRadius: 6,
            textAlign: 'center',
          }}
        >
          {hud.toast}
        </div>
      )}
    </div>
  );
}

function GuideUI() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '10px 12px',
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.6,
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
      }}
    >
      <div><strong>操作说明</strong></div>
      <div>W / A / S / D：移动</div>
      <div>鼠标拖动：旋转视角</div>
      <div>滚轮：缩放</div>
      <div>目标：收集所有金币</div>
    </div>
  );
}

function TaskUI({ collected, total }) {
  const done = total > 0 && collected >= total;

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        background: done ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 33, 33, 0.82)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: 10,
        fontFamily: 'sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        minWidth: 220,
      }}
    >
      <div style={{ fontWeight: 700 }}>
        {done ? '任务完成' : '当前任务：收集全部金币'}
      </div>
      <div>
        进度：{collected} / {total}
      </div>
    </div>
  );
}

function MobileControls({ controller }) {
  const btnStyle = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(0,0,0,0.35)',
    color: 'white',
    minWidth: 56,
    touchAction: 'none',
  };

  const bind = (partial) => ({
    onPointerDown: () => controller.setMove(partial),
    onPointerUp: () =>
      controller.setMove(Object.fromEntries(Object.keys(partial).map((k) => [k, false]))),
  });

  return (
    <div style={{
      position: 'absolute',
      left: 12,
      bottom: 12,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, auto)',
      gap: 8,
    }}>
      <div />
      <button {...bind({ forward: true })} style={btnStyle}>↑</button>
      <div />
      <button {...bind({ left: true })} style={btnStyle}>←</button>
      <button {...bind({ backward: true })} style={btnStyle}>↓</button>
      <button {...bind({ right: true })} style={btnStyle}>→</button>
    </div>
  );
}

// ----------------------------------------------------
// App
// ----------------------------------------------------

function App() {
  const controller = useRobotController();

  const totalCoins = CONTROLS_CONFIG.coins.total;

  const [coinCollected, setCoinCollected] = useState(() =>
    Array.from({ length: totalCoins }, () => false)
  );

  const collectedCount = useMemo(
    () => coinCollected.reduce((acc, v) => acc + (v ? 1 : 0), 0),
    [coinCollected]
  );

  const [debug, setHudDebug] = useState({
    pos: '0,0,0',
    rot: '0°',
    speed: '0',
  });

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg, ms) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  };

  const coinPositions = useMemo(
    () =>
      generateCoinPositions({
        total: totalCoins,
        area: CONTROLS_CONFIG.coins.area,
        y: CONTROLS_CONFIG.coins.y,
        minSpacing: CONTROLS_CONFIG.coins.minSpacing,
        forbidden: [],
      }),
    [totalCoins]
  );

  const onCoinCollect = (id) => {
    setCoinCollected((prev) => {
      if (prev[id]) return prev;
      const next = prev.slice();
      next[id] = true;
      return next;
    });
    showToast('金币收集成功', 700);
  };

  const hud = useMemo(
    () => ({
      coins: { collected: collectedCount, total: totalCoins },
      debug,
      toast,
    }),
    [collectedCount, totalCoins, debug, toast]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Suspense fallback={null}>
          <GameScene
            controller={controller}
            setHudDebug={setHudDebug}
            coinPositions={coinPositions}
            coinCollected={coinCollected}
            onCoinCollect={onCoinCollect}
          />
        </Suspense>
      </Canvas>

      <Loader />
      <GuideUI />
      <TaskUI collected={collectedCount} total={totalCoins} />
      <UIPanel controller={controller} hud={hud} />
      <MobileControls controller={controller} />
    </div>
  );
}

export default App;