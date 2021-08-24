import {
  WebGLRenderTarget,
  DepthTexture,
  NearestFilter,
  Vector2,
  ShaderMaterial,
  Vector4,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  OrthographicCamera,
  RGBAFormat,
  RGBFormat,
  MeshNormalMaterial,
  Vector3,
  Scene,
} from 'three';
import fragmentShader from 'shaders/pixelFrag.glsl';
import vertexShader from 'shaders/pixelVert.glsl';

const PIXEL_SIZE = 3;

const pixelRenderTarget = (resolution, pixelFormat, useDepthTexture) => {
  const renderTarget = new WebGLRenderTarget(
    resolution.x,
    resolution.y,
    useDepthTexture
      ? {
          depthTexture: new DepthTexture(resolution.x, resolution.y),
          depthBuffer: true,
        }
      : undefined
  );

  renderTarget.texture.format = pixelFormat;
  renderTarget.texture.minFilter = NearestFilter;
  renderTarget.texture.magFilter = NearestFilter;
  renderTarget.texture.generateMipmaps = false;
  renderTarget.stencilBuffer = false;

  return renderTarget;
};

class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.renderResolution = new Vector2();

    const material = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tNormal: { value: null },
        scaleX: { type: 'f', value: 1.0 },
        resolution: {
          value: new Vector4(
            this.renderResolution.x,
            this.renderResolution.y,
            1 / this.renderResolution.x,
            1 / this.renderResolution.y
          ),
        },
      },
      fragmentShader,
      vertexShader,
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
    );
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    this.mesh = new Mesh(geometry, material);
    this.meshScene = new Scene();
    this.meshScene.add(this.mesh);
    this.meshCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.currentSize = new Vector2();
    this.eyeLPos = new Vector3();
    this.eyeRPos = new Vector3();

    this.rgbRenderTarget = pixelRenderTarget(this.renderResolution, RGBAFormat, true);
    this.normalRenderTarget = pixelRenderTarget(this.renderResolution, RGBFormat, false);

    this.normalMaterial = new MeshNormalMaterial();

    const onSessionStart = () => {
      const baseLayer = this.renderer.xr.getBaseLayer();
      const width = baseLayer.context?.drawingBufferWidth || baseLayer.textureWidth;
      const height = baseLayer.context?.drawingBufferHeight || baseLayer.textureHeight;

      this.renderer.setDrawingBufferSize(width, height, 1);
      this.setSize(width, height);
      this.currentSize.set(width, height);

      this.mesh.material.uniforms.scaleX.value = 2.0;
    };

    const onSessionEnd = () => {
      const { innerWidth, innerHeight } = window;

      this.renderer.setSize(innerWidth, innerHeight);
      this.setSize(innerWidth, innerHeight);
      this.currentSize.set(innerWidth, innerHeight);

      this.mesh.material.uniforms.scaleX.value = 1.0;
    };

    this.renderer.xr.addEventListener('sessionstart', onSessionStart);
    this.renderer.xr.addEventListener('sessionend', onSessionEnd);
  }

  setSize(width, height) {
    const [x, y] = [(width / PIXEL_SIZE) | 0, (height / PIXEL_SIZE) | 0];
    this.renderResolution.set(x, y);

    this.rgbRenderTarget.setSize(x, y);
    this.normalRenderTarget.setSize(x, y);
    this.mesh.material.uniforms.resolution.value.set(x, y, 1 / x, 1 / y);
  }

  renderFrame() {
    // Render colors
    this.renderer.setRenderTarget(this.rgbRenderTarget);
    this.renderer.render(this.scene, this.camera);

    // Render normals
    this.renderer.setRenderTarget(this.normalRenderTarget);
    this.scene.overrideMaterial = this.normalMaterial;
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.scene.overrideMaterial = null;

    // Update uniforms
    const uniforms = this.mesh.material.uniforms;
    uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
    uniforms.tDepth.value = this.rgbRenderTarget.depthTexture;
    uniforms.tNormal.value = this.normalRenderTarget.texture;

    // Render effect mesh
    this.renderer.render(this.meshScene, this.meshCamera);
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    // Disable stereo projection
    let isXREnabled = this.renderer.xr.enabled;
    if (isXREnabled) {
      this.renderer.xr.enabled = false;
    }

    if (this.renderer.xr.isPresenting) {
      const { cameras } = this.renderer.xr.getCamera();
      const [cameraL, cameraR] = cameras;

      this.eyeLPos.setFromMatrixPosition(cameraL.matrixWorld);
      this.eyeRPos.setFromMatrixPosition(cameraR.matrixWorld);

      const IPD = this.eyeLPos.distanceTo(this.eyeRPos);

      const projL = cameraL.projectionMatrix.elements;
      const projR = cameraR.projectionMatrix.elements;

      const leftFov = (projL[8] - 1) / projL[0];
      const rightFov = (projR[8] + 1) / projR[0];

      const zOffset = IPD / (-leftFov + rightFov);
      const xOffset = zOffset * -leftFov;

      cameras.forEach((camera, index) => {
        const [x, y, width, height] = camera.viewport.toArray();

        this.mesh.translateX(xOffset * (index ? -1 : 1));

        this.renderer.setViewport(x, y, width, height);
        this.renderer.setScissor(x, y, width, height);
        this.renderer.setScissorTest(true);

        this.renderFrame();
      });

      this.renderer.setViewport(0, 0, this.currentSize.x, this.currentSize.y);
      this.renderer.setScissor(0, 0, this.currentSize.x, this.currentSize.y);
      this.renderer.setScissorTest(false);

      this.mesh.position.set(0, 0, 0);
    } else {
      this.renderFrame();
    }

    // Re-enable stereo projection
    this.renderer.xr.enabled = isXREnabled;
  }
}

export default PostProcessing;
