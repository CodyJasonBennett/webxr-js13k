import {
  Points,
  Vector3,
  Spherical,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
} from 'three';
import fragmentShader from 'shaders/starFrag.glsl';
import vertexShader from 'shaders/starVert.glsl';

const RADIUS = 8000;

class Stars extends Points {
  constructor({ count = 1000 } = {}) {
    const positions = Array.from({ length: count }, () =>
      new Vector3()
        .setFromSpherical(
          new Spherical(
            RADIUS + Math.random() * (RADIUS + 50 - RADIUS),
            Math.acos(1 - Math.random() * 2),
            Math.random() * 2 * Math.PI
          )
        )
        .toArray()
    ).flat();
    const sizes = Array.from({ length: count }, () => 0.5 + 1 * Math.random());

    const geometry = new BufferGeometry({ count: positions.length / 3 });
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3)
    );
    geometry.setAttribute('size', new BufferAttribute(new Float32Array(sizes), 1));

    const material = new ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
      },
      fragmentShader,
      vertexShader,
    });
    material.blending = AdditiveBlending;

    super(geometry, material);
  }

  update(time) {
    this.material.uniforms.time.value = time / 1000;
  }
}

export default Stars;
