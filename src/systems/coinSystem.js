export function generateCoinPositions({ total, area, y, minSpacing, forbidden }) {
  const positions = [];
  const maxAttempts = 5000;
  let attempts = 0;

  while (positions.length < total && attempts < maxAttempts) {
    attempts += 1;

    const x = area.minX + Math.random() * (area.maxX - area.minX);
    const z = area.minZ + Math.random() * (area.maxZ - area.minZ);

    let ok = true;

    for (const f of forbidden) {
      const dx = x - f.x;
      const dz = z - f.z;
      if (dx * dx + dz * dz < (f.r + minSpacing) * (f.r + minSpacing)) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    for (const p of positions) {
      const dx = x - p[0];
      const dz = z - p[2];
      if (dx * dx + dz * dz < minSpacing * minSpacing) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    positions.push([x, y, z]);
  }

  while (positions.length < total) {
    positions.push([0, y, 0]);
  }

  return positions;
}