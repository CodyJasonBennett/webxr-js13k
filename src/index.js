import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  Fog,
  AmbientLight,
  Group,
} from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import PostProcessing from 'managers/PostProcessing';
import Controls from 'managers/Controls';
import Audio from 'managers/Audio';
import Stars from 'objects/Stars';
import Model from 'objects/Model';
import xwingData from 'assets/xwing';
import tieData from 'assets/tie';

const { innerWidth, innerHeight } = window;

const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

if ('xr' in navigator) {
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));
}

const camera = new PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 50000);
camera.position.z = 20;

const scene = new Scene();
scene.background = new Color(0x020209);
scene.fog = new Fog(0x070715, 100, 500);

const effects = new PostProcessing(renderer, scene, camera);
effects.setSize(innerWidth, innerHeight);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const stars = new Stars();
scene.add(stars);

const player = new Group();
scene.add(player);
player.add(camera);

const xwing = new Model(xwingData);
xwing.rotation.y = Math.PI;
xwing.position.x = xwing.size.x / 2;
xwing.position.y -= 8;
player.add(xwing);

const tie = new Model(tieData);
tie.position.z = 25;
scene.add(tie);

const controls = new Controls(player, renderer.domElement);

const audio = new Audio();

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;

  renderer.setSize(innerWidth, innerHeight);
  effects.setSize(innerWidth, innerHeight);

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

const handleLock = () => {
  renderer.domElement.requestPointerLock();
  document.body.addEventListener('click', handleLock);
};
document.body.addEventListener('click', handleLock);

renderer.setAnimationLoop(() => {
  // Animate FOV when boosting
  if (controls.boosted && camera.fov < 80) {
    camera.fov += 0.2;
    camera.updateProjectionMatrix();
  } else if (!controls.boosted && camera.fov > 70) {
    camera.fov -= 0.2;
    camera.updateProjectionMatrix();
  }

  controls.update();
  audio.update();

  scene.traverse(node => node.update?.());

  // renderer.render(scene, camera);
  effects.render();
});
