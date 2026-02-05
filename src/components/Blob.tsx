'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { blobVertexShader, blobFragmentShader, themes, ThemeName } from '@/lib/shaders';

interface BlobProps {
  audioIntensity: number;
  theme: ThemeName;
}

export function Blob({ audioIntensity, theme }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const themeColors = themes[theme];

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioIntensity: { value: 0 },
      uColor1: { value: new THREE.Vector3(...themeColors.color1) },
      uColor2: { value: new THREE.Vector3(...themeColors.color2) },
      uColor3: { value: new THREE.Vector3(...themeColors.color3) },
      uEdgeColor: { value: new THREE.Vector3(...themeColors.edgeColor) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Smooth transition for audio intensity
      material.uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uAudioIntensity.value,
        audioIntensity,
        0.1
      );

      // Smooth transition for colors
      const targetColors = themes[theme];
      material.uniforms.uColor1.value.lerp(new THREE.Vector3(...targetColors.color1), 0.05);
      material.uniforms.uColor2.value.lerp(new THREE.Vector3(...targetColors.color2), 0.05);
      material.uniforms.uColor3.value.lerp(new THREE.Vector3(...targetColors.color3), 0.05);
      material.uniforms.uEdgeColor.value.lerp(new THREE.Vector3(...targetColors.edgeColor), 0.05);

      // Subtle rotation
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} scale={0.67}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
