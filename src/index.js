import { useEffect } from 'react';
import { useThree, render } from '@react-three/fiber';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import Controls from './Controls';

const Scene = () => {
  const { gl, camera } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    gl.setClearAlpha(1);
    camera.position.set(0, 1.3, 3);

    const button = VRButton.createButton(gl);
    document.body.appendChild(button);

    return () => {
      document.body.removeChild(button);
    };
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
