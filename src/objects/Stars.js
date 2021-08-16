import { Points, BufferGeometry, BufferAttribute, PointsMaterial } from 'three';

class Stars extends Points {
  constructor({ count = 1000 } = {}) {
    const positions = [];

    for (let i = 0; i < count; i++) {
      const r = 400;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.cos(theta) * Math.sin(phi) + (-200 + Math.random() * 400);
      const y = r * Math.sin(theta) * Math.sin(phi) + (-200 + Math.random() * 400);
      const z = r * Math.cos(phi) + (-100 + Math.random() * 200);

      positions.push(x, y, z);
    }

    const stars = new Float32Array(positions);

    const starsGeometry = new BufferGeometry({ count: positions.length / 3 });
    starsGeometry.setAttribute('position', new BufferAttribute(stars, 3));

    const starsMaterial = new PointsMaterial({ fog: false });

    super(starsGeometry, starsMaterial);
  }
}

export default Stars;
