import { InstancedMesh, BoxGeometry, MeshStandardMaterial, Object3D, Color } from 'three';

class Model extends InstancedMesh {
  constructor(points) {
    const count = points.flatMap(line => line.slice(3)).length;

    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial();
    super(geometry, material, count);

    const tempObject = new Object3D();
    const tempColor = new Color();

    let index = 0;
    points.forEach(([x, y, z, ...colors]) => {
      colors.forEach((color, offset) => {
        tempObject.position.set(x, y, z + offset);
        tempObject.updateMatrix();
        this.setMatrixAt(index, tempObject.matrix);

        tempColor.setHex(color);
        this.setColorAt(index, tempColor);

        index++;
      });
    });
    this.instanceMatrix.needsUpdate = true;
  }
}

export default Model;
