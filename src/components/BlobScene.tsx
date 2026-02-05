'use client';

import { Canvas } from '@react-three/fiber';
import { Blob } from './Blob';
import { ThemeName } from '@/lib/shaders';

interface BlobSceneProps {
  audioIntensity: number;
  theme: ThemeName;
}

export function BlobScene({ audioIntensity, theme }: BlobSceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4060ff" />
        <Blob audioIntensity={audioIntensity} theme={theme} />
      </Canvas>
    </div>
  );
}
