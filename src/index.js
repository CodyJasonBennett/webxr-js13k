import { WebGLRenderer, PerspectiveCamera, Scene, Color, Fog, AmbientLight } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stars from './Stars';
import Ship from './Ship';

const { innerWidth, innerHeight } = window;

const renderer = new WebGLRenderer({ antialias: true });
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(9, 2, 15);

const scene = new Scene();
scene.background = new Color(0x020209);
scene.fog = new Fog(0x070715, 10, 100);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const stars = new Stars();
scene.add(stars);

const ship = new Ship();
scene.add(ship);

renderer.setAnimationLoop(() => {
  controls.update();

  scene.traverse(node => node.update?.());

  renderer.render(scene, camera);
});
