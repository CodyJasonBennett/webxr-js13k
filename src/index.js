import { useEffect } from 'react';
import { useThree, render } from '@react-three/fiber';
import Controls from './Controls';

const Scene = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.3, 3);
  }, [camera]);

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
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
