import { InstancedMesh, BoxGeometry, MeshStandardMaterial, Object3D, Color } from 'three';
import xwing from '../data/xwing';

class XWing extends InstancedMesh {
  constructor() {
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ instancingColor: true });
    super(geometry, material, xwing.length);

    const tempObject = new Object3D();
    const tempColor = new Color();

    xwing.forEach(([x, y, z, color = 0xc1c1c1], index) => {
      tempObject.position.set(x, y, z);
      tempObject.updateMatrix();
      this.setMatrixAt(index, tempObject.matrix);

      tempColor.setHex(color);
      this.setColorAt(index, tempColor);
    });
    this.instanceMatrix.needsUpdate = true;
  }
}

export default XWing;
