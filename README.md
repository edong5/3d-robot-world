# 3D Robot World

本项目基于 Vite + React + Three.js (@react-three/fiber) 栈，移植重构了 Three.js 官方示例 `webgl_animation_skinning_morph` 中的骨骼动画与形变机器人模型。

## 主要特性

- **机器人模型移植**：加载 `public/models/robot.glb`，完整保留 states（Idle/Walking/Running/Dance/Death/Sitting/Standing）、emotes（Jump/Yes/No/Wave/Punch/ThumbsUp）与 expressions（Angry/Happy/Sad/Surprised）。
- **动画系统**：参考原示例的 `fadeToAction` 逻辑实现平滑过渡；emotes 播放完成后自动恢复到当前 base state。
- **地理环境与碰撞**：基础地面 + 网格 + 天空；用射线下探做地形碰撞（可站上方块/平台），支持跳跃重力。
- **交互控制**：右上角 UI 面板切换 state / expression，并触发 emotes；键盘支持 WASD、Shift 加速、Space 跳跃；移动端提供屏幕按键。

## 本地启动与构建

### 依赖安装
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm install
```

### 启动开发服务器
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev
```

如果提示 `Port 5173 is already in use`，说明已有一个开发服务器在运行：
- 直接关闭旧的 dev 终端，或
- 重新运行 `npm run dev` 让 Vite 自动选择下一个可用端口，并以终端输出的地址为准（例如 `http://127.0.0.1:5174/`）。

### 构建生产版本
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run build
```

## 模型替换说明
本项目的机器人模型位于 `public/models/robot.glb`。如果需要替换为自定义模型：
1. 将新的 `.glb` 文件放置在 `public/models/` 目录下（或覆盖原有文件）。
2. 在 [RobotActor.jsx](file:///D:/Trae/3D机器人/robot-world/src/components/RobotActor.jsx) 中，更新 `useGLTF('/models/robot.glb')` 路径与 `useGLTF.preload()` 路径。
3. 如果新模型的动画名称或 morph 目标网格名称不同，需要同步修改：
   - 动画：确保 states / emotes 的 clip 名称与 UI 列表一致（或做映射）。
   - 表情：将 `nodes.Head_4` 替换为新模型中包含 `morphTargetDictionary` 的网格节点名称。

## 性能说明
见 [PERFORMANCE.md](file:///D:/Trae/3D机器人/robot-world/PERFORMANCE.md)。
