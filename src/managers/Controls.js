import { Clock, Quaternion, Vector3 } from 'three';

const UPDATE_THRESHOLD = 0.000001;
const MOVEMENT_SPEED = 80;
const ROLL_SPEED = 0.8;
const BOOST_MULTIPLIER = 1.5;

class Controls {
  constructor(object, domElement) {
    this.object = object;
    this.domElement = domElement;

    this.boosted = false;

    this.clock = new Clock();

    this.lastQuaternion = new Quaternion();
    this.lastPosition = new Vector3();

    this.tmpQuaternion = new Quaternion();

    this.moveState = {
      pitchUp: 0,
      pitchDown: 0,
      yawLeft: 0,
      yawRight: 0,
      rollLeft: 0,
      rollRight: 0,
    };
    this.rotation = new Vector3(0, 0, 0);

    this.keydown = this.keydown.bind(this);
    this.keyup = this.keyup.bind(this);
    this.update = this.update.bind(this);

    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('contextmenu', e => e.preventDefault());

    this.updaterotation();
  }

  updaterotation() {
    this.rotation.x = -this.moveState.pitchDown + this.moveState.pitchUp;
    this.rotation.y = -this.moveState.yawRight + this.moveState.yawLeft;
    this.rotation.z = -this.moveState.rollRight + this.moveState.rollLeft;
  }

  handleKey(key, value) {
    switch (key) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.boosted = value;
        break;

      case 'ArrowUp':
        this.moveState.pitchDown = value;
        break;
      case 'ArrowDown':
        this.moveState.pitchUp = value;
        break;

      case 'ArrowLeft':
        this.moveState.rollLeft = value;
        break;
      case 'ArrowRight':
        this.moveState.rollRight = value;
        break;

      default:
        return;
    }

    this.updaterotation();
  }

  keydown(event) {
    if (event.altKey) return;

    this.handleKey(event.code, 1);
  }

  keyup(event) {
    if (event.altKey) return;

    this.handleKey(event.code, 0);
  }

  update() {
    const delta = this.clock.getDelta();

    const boostMult = this.boosted ? BOOST_MULTIPLIER : 1;
    const moveMult = delta * MOVEMENT_SPEED * boostMult;
    const rotMult = delta * ROLL_SPEED;

    this.object.translateZ(-moveMult);

    this.tmpQuaternion
      .set(
        this.rotation.x * rotMult,
        this.rotation.y * rotMult,
        this.rotation.z * rotMult,
        1
      )
      .normalize();
    this.object.quaternion.multiply(this.tmpQuaternion);

    if (
      this.lastPosition.distanceToSquared(this.object.position) > UPDATE_THRESHOLD ||
      8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > UPDATE_THRESHOLD
    ) {
      this.lastQuaternion.copy(this.object.quaternion);
      this.lastPosition.copy(this.object.position);
    }
  }
}

export default Controls;
