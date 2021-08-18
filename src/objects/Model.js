import { InstancedMesh, BoxGeometry, MeshStandardMaterial, Object3D, Color } from 'three';
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

    let index = 0;
    points.forEach(([x, y, z, ...colorIndices]) => {
      colorIndices.forEach((colorIndex, offset) => {
        tempObject.position.set(x, y, z + offset);
        tempObject.updateMatrix();
        this.setMatrixAt(index, tempObject.matrix);

        tempColor.setHex(colors[colorIndex]);
        this.setColorAt(index, tempColor);

        index++;
      });
    });
    this.instanceMatrix.needsUpdate = true;

    this.scale.divideScalar(10);
  }
}

export default Model;
