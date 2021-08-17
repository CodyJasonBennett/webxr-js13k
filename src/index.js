import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  Fog,
  AmbientLight,
  AudioContext,
} from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stars from './objects/Stars';
import Model from './objects/Model';
import xwingData from './data/xwing';
import tieData from './data/tie';
import { playNote } from './utils/audio';
import { decode } from './utils/data';
import menu from './data/menu';

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
camera.position.set(8, 16, 48);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const scene = new Scene();
scene.background = new Color(0x020209);
scene.fog = new Fog(0x070715, 100, 500);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const stars = new Stars();
scene.add(stars);

const xwing = new Model(xwingData);
xwing.position.x = -16;
scene.add(xwing);

const tie = new Model(tieData);
tie.position.x = 16;
scene.add(tie);

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;

  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

const context = AudioContext.getContext();

const queue = decode(menu).reduce((output, [note, offset, bars]) => {
  output.push({ note, start: offset * 0.15, duration: bars * 0.15, playing: false });

  return output;
}, []);

renderer.setAnimationLoop(() => {
  controls.update();

  queue.forEach(({ note, start, duration, playing = false }, index) => {
    const shouldPlay =
      context.currentTime > start && context.currentTime < start + duration;

    if (!playing && shouldPlay) {
      playNote(context, note, duration);
      queue[index].playing = true;
    }
  });

  scene.traverse(node => node.update?.());

  renderer.render(scene, camera);
});
