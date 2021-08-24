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
  Scene,
  OrthographicCamera,
  RGBAFormat,
  RGBFormat,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
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

    this.vrRenderer = new WebGLRenderer({ preserveDrawingBuffer: true });
    this.vrMesh = new Mesh(geometry, new MeshBasicMaterial({ map: new Texture() }));
    this.vrCanvas = document.createElement('canvas');
    this.vrContext = this.vrCanvas.getContext('2d');

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
    };

    const onSessionEnd = () => {
      const { innerWidth, innerHeight } = window;

      this.renderer.setSize(innerWidth, innerHeight);
      this.setSize(innerWidth, innerHeight);
    };

    this.renderer.xr.addEventListener('sessionstart', onSessionStart);
    this.renderer.xr.addEventListener('sessionend', onSessionEnd);
  }

  setSize(width, height) {
    this.vrRenderer.setSize(width, height);

    this.vrCanvas.width = width;
    this.vrCanvas.height = height;

    const [x, y] = [(width / PIXEL_SIZE) | 0, (height / PIXEL_SIZE) | 0];
    this.renderResolution.set(x, y);

    this.rgbRenderTarget.setSize(x, y);
    this.normalRenderTarget.setSize(x, y);
    this.mesh.material.uniforms.resolution.value.set(x, y, 1 / x, 1 / y);
  }

  renderFrame() {
    const renderer = this.renderer.xr.isPresenting ? this.vrRenderer : this.renderer;

    // Render colors
    renderer.setRenderTarget(this.rgbRenderTarget);
    renderer.render(this.scene, this.camera);

    // Render normals
    renderer.setRenderTarget(this.normalRenderTarget);
    this.scene.overrideMaterial = this.normalMaterial;
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
    this.scene.overrideMaterial = null;

    // Update uniforms
    const uniforms = this.mesh.material.uniforms;
    uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
    uniforms.tDepth.value = this.rgbRenderTarget.depthTexture;
    uniforms.tNormal.value = this.normalRenderTarget.texture;

    // Render effect mesh
    renderer.render(this.meshScene, this.meshCamera);
  }

  render() {
    // Disable xr projection
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

        // Offset eye camera
        this.mesh.translateX(xOffset * (index ? 1 : -1));

        this.renderFrame();
        this.vrContext.drawImage(
          this.vrRenderer.domElement,
          width / 2,
          0,
          width,
          height,
          x,
          y,
          width,
          height
        );
      });

      // Update stereo projection plane
      this.vrMesh.material.map.image = this.vrCanvas;
      this.vrMesh.material.map.needsUpdate = true;

      // Render effect
      this.renderer.render(this.vrMesh, this.meshCamera);

      // Cleanup mono projection plane
      this.mesh.position.set(0, 0, 0);
    } else {
      this.renderFrame();
    }

    // Re-enable xr projection
    this.renderer.xr.enabled = isXREnabled;
  }
}

export default PostProcessing;
