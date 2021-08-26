import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  Fog,
  Group,
  AmbientLight,
  Clock,
  Vector3,
} from 'three';
import PostProcessing from 'managers/PostProcessing';
import Controls from 'managers/Controls';
import Audio from 'managers/Audio';
import Stars from 'objects/Stars';
import Model from 'objects/Model';
import xwingData from 'assets/xwing';

const { innerWidth, innerHeight } = window;

const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const onClick = async () => {
  if (renderer.xr.isPresenting) return;

  const supportsVR = await navigator.xr?.isSessionSupported('immersive-vr');
  if (!supportsVR) return renderer.domElement.requestPointerLock();

  renderer.xr.enabled = true;
  const session = await navigator.xr.requestSession('immersive-vr', {
    optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
  });
  await renderer.xr.setSession(session);
};

document.body.addEventListener('click', onClick);

const camera = new PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 50000);
camera.position.z = 30;

const scene = new Scene();
scene.background = new Color(0x020209);
scene.fog = new Fog(0x070715, 100, 500);

const effects = new PostProcessing(renderer, scene, camera);
effects.setSize(innerWidth, innerHeight);

const player = new Group();
scene.add(player);

const controls = new Controls(player, renderer.domElement);

const audio = new Audio();

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const stars = new Stars();
scene.add(stars);

const xwing = new Model(xwingData);
xwing.rotation.y = Math.PI;
xwing.position.x = xwing.size.x / 2;
player.add(xwing);

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;

  renderer.setSize(innerWidth, innerHeight);
  effects.setSize(innerWidth, innerHeight);

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

const clock = new Clock();

const direction = new Vector3();
const offset = new Vector3();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  controls.update(delta);
  audio.update(delta);

  scene.traverse(node => node.update?.(delta));

  // Use camera animations when not in WebXR
  if (!renderer.xr.isPresenting) {
    // Animate FOV when boosting
    if (controls.boosted && camera.fov < 70) {
      camera.fov += 0.2;
      camera.updateProjectionMatrix();
    } else if (!controls.boosted && camera.fov > 60) {
      camera.fov -= 0.2;
      camera.updateProjectionMatrix();
    }

    // Animate follow camera
    offset.copy(player.position);
    offset.lerp(player.position, 0.4);

    direction.copy(offset).sub(camera.position).normalize();
    const distance = offset.distanceTo(camera.position) - 20;
    camera.position.addScaledVector(direction, distance);

    camera.lookAt(player.position);
    camera.quaternion.copy(player.quaternion);
  }

  effects.render();
});
