import { useMemo, useEffect } from 'react';
import { useThree, useFrame, render } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Scene = () => {
  const { gl, camera } = useThree();
  const controls = useMemo(
    () => new OrbitControls(camera, gl.domElement),
    [camera, gl.domElement]
  );

  useEffect(() => {
    gl.setClearColor(0x4c4c4c);
    camera.position.set(0, 1.3, 3);
    controls.enableDamping = true;

    return () => {
      controls.dispose();
    };
  }, [gl, camera, controls]);

  useFrame(() => {
    if (controls.enabled) controls.update();
  });

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[4, 4]} />
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
