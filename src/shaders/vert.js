export default `
  uniform float scaleX;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    mat4 VRTransform = mat4(
      scaleX, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );

    gl_Position = projectionMatrix * modelViewMatrix * VRTransform * vec4(position, 1.0);
  }
`;
