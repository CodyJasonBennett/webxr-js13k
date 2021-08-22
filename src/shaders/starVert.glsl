uniform float time;
attribute float size;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);

  gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(mvPosition.x + 2.0 * size * time + 100.0 * size));
  gl_Position = projectionMatrix * mvPosition;
}
