import { useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Controls = props => {
  const { gl, camera } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [
    camera,
    gl.domElement,
  ]);

  useFrame(() => {
    if (controls.enabled) controls.update();
  });

  return <primitive object={controls} {...props} />;
};

export default Controls;
