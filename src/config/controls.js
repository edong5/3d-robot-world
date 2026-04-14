export const CONTROLS_CONFIG = {
  moveBaseSpeed: 8.0,
  walkFactor: 0.5,
  runFactor: 1.5,
  
  // 旋转速度（弧度/秒，对应约 1 度/帧）
  rotationSpeed: 1.0,
  autoFaceLerpPerFrame: 0.15,
  
  // 惯性参数
  acceleration: 10.0,
  deceleration: 15.0,
  
  // 摄像机参数
  camera: {
    minZoom: 0.5,
    maxZoom: 5.0,
    baseDistance: 10,
    minDistance: 5,
    maxDistance: 50,
    dampingFactor: 0.05,
    targetHeightOffset: 2,
  },
  
  // 物理边界
  boundaries: {
    minX: -100,
    maxX: 100,
    minZ: -100,
    maxZ: 100,
  },

  coins: {
    total: 8,
    y: 0.5,
    minSpacing: 1.2,
    area: {
      minX: -12,
      maxX: 12,
      minZ: -12,
      maxZ: 12,
    },
  },
  
  // 跳跃
  jumpVelocityY: 8.0,
  gravity: -9.8
};
