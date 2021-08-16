import { useEffect } from 'react';
import { useThree, render } from '@react-three/fiber';
import Controls from './Controls';

const Scene = () => {
  const { gl, camera } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    gl.setClearAlpha(1);
    camera.position.set(0, 1.3, 3);

    navigator.xr?.isSessionSupported('immersive-vr').then(supported => {
      if (!supported) return;

      navigator.xr
        .requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
        })
        .then(gl.xr.setSession);
    });
  }, [gl, camera]);

  return (
    <>
      <gridHelper args={[4, 4]} />
      <Controls enableDamping />
    </>
  );
};

const handleResize = () => {
  const { innerWidth, innerHeight } = window;

  render(<Scene />, document.querySelector('canvas'), {
    size: { width: innerWidth, height: innerHeight },
  });
};

window.addEventListener('resize', handleResize);
handleResize();
