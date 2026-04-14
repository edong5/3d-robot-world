# 3D Robot World

一个基于 React + Three.js 的交互式 3D 机器人项目，实现了角色控制、动画系统、物理碰撞、金币收集及 UI 交互，并在 AI 辅助开发基础上完成了工程化重构。

---

## 项目简介

本项目基于 Three.js 官方示例 webgl_animation_skinning_morph 进行扩展开发，并结合 AI 工具生成基础代码，在此基础上完成结构重构与功能完善。

用户可以通过键盘与鼠标控制机器人在 3D 场景中移动、观察和交互，并完成金币收集任务。

项目重点在于：

- 对 AI 生成代码进行理解与重构
- 构建清晰的前端 3D 项目结构
- 实现完整交互闭环（操作 → 场景变化 → UI反馈）

---

## 技术栈

- React
- Three.js
- @react-three/fiber
- @react-three/drei
- @react-three/rapier
- Vite

---

## 功能说明

### 视角控制
- 鼠标拖动旋转视角
- 滚轮缩放
- 相机跟随角色移动（OrbitControls + target）

### 角色控制
- WASD 控制移动
- Shift 加速
- Space 跳跃
- 基于角色朝向计算移动方向

### 动画系统
- 支持 Idle / Walking / Running / Dance 等状态
- 支持 Emote 动作（Jump / Wave / Punch 等）
- 使用 fadeToAction 实现平滑过渡
- Emote 播放结束自动恢复基础状态

### 金币系统
- 金币由 coinSystem 生成
- 碰撞后自动消失
- 实时更新收集数量
- 完成后触发提示

### 物理系统
- 基于 Rapier 实现：
  - 重力
  - 跳跃
  - 碰撞检测
  - 触发器（金币）

### 交互反馈
- 金币收集音效
- 障碍物碰撞音效
- Toast 提示

### UI 系统
- 操作说明（GuideUI）
- 任务进度（Task UI）
- 控制面板（动作 / 表情）
- 移动端控制按钮

---

## 操作方式

- W / A / S / D：移动
- Shift：加速
- Space：跳跃
- 鼠标拖动：旋转视角
- 滚轮：缩放
- 目标：收集所有金币

---
'''
## 项目结构

src/
├── App.jsx
├── scenes/
│   └── GameScene.jsx
├── components/
│   ├── Coin.jsx
│   ├── Obstacle.jsx
│   ├── PhysicsPlayer.jsx
│   └── RobotActor.jsx
├── systems/
│   └── coinSystem.js
├── hooks/
│   └── useRobotController
├── config/
│   └── controls.js
'''
---

## 项目亮点

### AI 辅助开发 + 工程化重构
基于 AI 生成代码，在此基础上完成：

- 模块拆分（App → Scene / Component / System）
- 逻辑整合与优化
- UI 与交互补充

将 Demo 提升为工程化项目。

### 分层架构设计
- Scene 层（3D 场景）
- Component 层（实体对象）
- System 层（逻辑规则）

实现低耦合结构。

### 3D 与 React 状态系统结合
实现 UI 与场景联动，以及实时状态更新。

### 完整交互闭环
操作 → 角色响应 → 场景变化 → UI反馈 → 完成目标

---

## 本地运行

cd robot-world
npm install
npm run dev

访问：
http://localhost:5173/

---

## 我的工作

- 对 AI 生成代码进行结构重构
- 实现角色控制与物理系统整合
- 设计并实现 UI 系统
- 调试动画系统与交互逻辑
- 完成交互流程设计与优化

---

## 模型说明

模型路径：

public/models/robot.glb

来源于 Three.js 官方示例，包含：

- states（Idle / Walking / Running / Dance 等）
- emotes（Jump / Wave / Punch 等）
- expressions（Angry / Happy / Sad 等）

---

## 性能说明

项目已进行基础性能优化，包括：

- 使用 useGLTF.preload() 进行模型预加载
- 动画采用平滑过渡减少卡顿
- 场景结构保持轻量

详细性能分析见 PERFORMANCE.md

---

## 项目演示

（视频链接）

---

## 总结

本项目重点在于将 AI 生成代码转化为结构清晰、可维护的工程项目，体现了对复杂系统的理解与工程化能力。
