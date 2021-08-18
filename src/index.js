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
import Controls from 'managers/Controls';
import Audio from 'managers/Audio';
import Stars from 'objects/Stars';
import Model from 'objects/Model';
import xwingData from 'assets/xwing';
import tieData from 'assets/tie';

const { innerWidth, innerHeight } = window;

const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(2);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

if ('xr' in navigator) {
  renderer.xr.enabled = true;
  renderer.xr.setFramebufferScaleFactor(2.0);
  document.body.appendChild(VRButton.createButton(renderer));
}

const camera = new PerspectiveCamera(70, innerWidth / innerHeight);

const scene = new Scene();
scene.background = new Color(0x020209);
scene.fog = new Fog(0x070715, 100, 500);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const stars = new Stars();
scene.add(stars);

const player = new Group();
scene.add(player);
player.add(camera);

const xwing = new Model(xwingData);
xwing.position.set(1, -0.8, -2);
xwing.rotation.y = Math.PI;
player.add(xwing);

const tie = new Model(tieData);
tie.position.x = 1;
scene.add(tie);

const controls = new Controls(player, renderer.domElement);

const audio = new Audio();

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;

  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

const start = () => {
  renderer.domElement.requestPointerLock();
  document.body.addEventListener('click', start);

  renderer.setAnimationLoop(() => {
    controls.update();
    audio.update();

    scene.traverse(node => node.update?.());

    renderer.render(scene, camera);
  });
};
document.body.addEventListener('click', start);
