import {
  InstancedMesh,
  BoxGeometry,
  MeshStandardMaterial,
  Object3D,
  Color,
  Vector3,
} from 'three';
import { decode } from 'utils/data';

class Model extends InstancedMesh {
  constructor({ points: data, colors }) {
    const points = typeof data === 'string' ? decode(data) : data;

    const count = points.flatMap(line => line.slice(3)).length;
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial();
    super(geometry, material, count);

    const tempObject = new Object3D();
    const tempColor = new Color();

    const coords = { x: [], y: [], z: [] };

    let index = 0;
    points.forEach(([x, y, z, ...colorIndices]) => {
      colorIndices.forEach((colorIndex, offset) => {
        tempObject.position.set(x, y, z + offset);
        tempObject.updateMatrix();
        this.setMatrixAt(index, tempObject.matrix);

        tempColor.setHex(colors[colorIndex]);
        this.setColorAt(index, tempColor);

        coords.x.push(x);
        coords.y.push(y);
        coords.z.push(z);

        index++;
      });
    });
    this.instanceMatrix.needsUpdate = true;

    this.size = new Vector3().fromArray(
      Object.values(coords).map(n => {
        const sorted = n.sort((a, b) => a - b);
        return sorted[sorted.length - 1] - sorted[0];
      })
    );

    this.position.copy(this.size).multiplyScalar(-0.5);
  }
}

export default Model;
