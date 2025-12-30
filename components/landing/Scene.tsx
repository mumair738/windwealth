'use client';

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useEffect, memo } from "react";
import * as THREE from "three";

import { waveFragmentShader, waveVertexShader } from './shaders';
import './scene.css';

const DPR = 1;

const DitheredWaves = memo(() => {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  // Initialize uniforms with proper default values
  // Three.js uniforms should be plain objects with 'value' property
  const uniforms = useRef({
    time: {
      value: 0.0,
    },
    resolution: {
      value: new THREE.Vector2(
        typeof window !== 'undefined' ? window.innerWidth * DPR : 1920,
        typeof window !== 'undefined' ? window.innerHeight * DPR : 1080
      ),
    },
    colorNum: {
      value: 4.0,
    },
    pixelSize: {
      value: 2.0,
    },
    mouse: {
      value: new THREE.Vector2(0.5, 0.5),
    },
  }).current;

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight); // Flip Y coordinate
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize resolution on mount and window resize
  useEffect(() => {
    const updateResolution = () => {
      if (uniforms.resolution.value) {
        uniforms.resolution.value.set(
          window.innerWidth * DPR,
          window.innerHeight * DPR
        );
      }
    };
    
    updateResolution();
    window.addEventListener('resize', updateResolution);
    return () => window.removeEventListener('resize', updateResolution);
  }, [uniforms]);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current && mesh.current.material) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = clock.getElapsedTime();
        // Ensure resolution is always valid
        if (material.uniforms.resolution?.value) {
          material.uniforms.resolution.value.set(
            window.innerWidth * DPR,
            window.innerHeight * DPR
          );
        }
        // Smoothly update mouse position
        if (material.uniforms.mouse?.value) {
          material.uniforms.mouse.value.lerp(
            new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
            0.1
          );
        }
      }
    }
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={waveFragmentShader}
          vertexShader={waveVertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
    </>
  );
});

DitheredWaves.displayName = 'DitheredWaves';

const Scene = memo(() => {
  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 0, 6] }} 
      dpr={[1, 1]}
      style={{ width: '100%', height: '100%', background: 'var(--color-background)' }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <DitheredWaves />
      </Suspense>
    </Canvas>
  );
});

Scene.displayName = 'Scene';

export default Scene;

