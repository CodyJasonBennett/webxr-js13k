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
} from 'three';
import vertexShader from 'shaders/vert';
import fragmentShader from 'shaders/frag';

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
      vertexShader,
      fragmentShader,
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
    );
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    this.mesh = new Mesh(geometry, material);
    this.meshCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

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
      this.renderer.setSize(this.currentSize.x, this.currentSize.y);
      this.setSize(this.currentSize.x, this.currentSize.y);
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

  render() {
    this.renderer.render(this.scene, this.camera);

    let isXREnabled = this.renderer.xr.enabled;
    if (isXREnabled) {
      this.renderer.xr.enabled = false;
    }

    const uniforms = this.mesh.material.uniforms;
    uniforms.scaleX.value = this.renderer.xr.isPresenting ? 2.0 : 1.0;

    this.renderer.setRenderTarget(this.rgbRenderTarget);
    this.renderer.render(this.scene, this.camera);

    const overrideMaterial_old = this.scene.overrideMaterial;
    this.renderer.setRenderTarget(this.normalRenderTarget);
    this.scene.overrideMaterial = this.normalMaterial;
    this.renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = overrideMaterial_old;

    uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
    uniforms.tDepth.value = this.rgbRenderTarget.depthTexture;
    uniforms.tNormal.value = this.normalRenderTarget.texture;

    this.renderer.setRenderTarget(null);

    if (this.renderer.xr.isPresenting) {
      const { cameras } = this.renderer.xr.getCamera();

      cameras.forEach(camera => {
        const [x, y, width, height] = camera.viewport.toArray();

        this.renderer.setViewport(x, y, width, height);
        this.renderer.setScissor(x, y, width, height);
        this.renderer.setScissorTest(true);

        this.renderer.render(this.mesh, this.meshCamera);
      });
    } else {
      this.renderer.render(this.mesh, this.meshCamera);
    }

    this.renderer.xr.enabled = isXREnabled;
  }
}

export default PostProcessing;
