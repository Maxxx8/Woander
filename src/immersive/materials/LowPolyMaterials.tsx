import React, { useMemo } from 'react';
import * as THREE from 'three';

export const useLowPolyMaterial = (
  color: string | number = 0x06d6a0,
  options: {
    metalness?: number;
    roughness?: number;
    flatShading?: boolean;
    emissive?: string | number;
    emissiveIntensity?: number;
  } = {}
) => {
  return useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: options.metalness ?? 0.2,
      roughness: options.roughness ?? 0.8,
      flatShading: options.flatShading ?? true,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
    });
  }, [color, options.metalness, options.roughness, options.flatShading, options.emissive, options.emissiveIntensity]);
};

export const useLowPolyGlassMaterial = (
  color: string | number = 0x118ab2,
  opacity: number = 0.6
) => {
  return useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      opacity,
      transparent: true,
      flatShading: true,
    });
  }, [color, opacity]);
};

export const useLowPolyMetallicMaterial = (
  color: string | number = 0x073b4c
) => {
  return useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true,
      envMapIntensity: 1,
    });
  }, [color]);
};

interface LowPolyShapeProps {
  geometry: 'sphere' | 'cube' | 'cylinder' | 'cone' | 'torus' | 'octahedron';
  material?: 'standard' | 'glass' | 'metallic';
  color?: string | number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const LowPolyShape: React.FC<LowPolyShapeProps> = ({
  geometry = 'sphere',
  material = 'standard',
  color = 0x06d6a0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const standardMaterial = useLowPolyMaterial(color);
  const glassMaterial = useLowPolyGlassMaterial(color as number);
  const metallicMaterial = useLowPolyMetallicMaterial(color as number);

  const selectedMaterial =
    material === 'glass' ? glassMaterial :
    material === 'metallic' ? metallicMaterial :
    standardMaterial;

  const geometryComponent = useMemo(() => {
    const detailLevel = 1;

    switch (geometry) {
      case 'sphere':
        return <sphereGeometry args={[1, 8, 6]} />;
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 8]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 8]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 8, 6]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, detailLevel]} />;
      default:
        return <sphereGeometry args={[1, 8, 6]} />;
    }
  }, [geometry]);

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      {geometryComponent}
      <primitive object={selectedMaterial} attach="material" />
    </mesh>
  );
};

export const generateLowPolyTerrain = (
  width: number = 10,
  height: number = 10,
  segments: number = 10
): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] = Math.random() * 2 - 1;
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
};

interface LowPolyTerrainProps {
  width?: number;
  height?: number;
  segments?: number;
  color?: string | number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const LowPolyTerrain: React.FC<LowPolyTerrainProps> = ({
  width = 10,
  height = 10,
  segments = 10,
  color = 0x06d6a0,
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
}) => {
  const geometry = useMemo(
    () => generateLowPolyTerrain(width, height, segments),
    [width, height, segments]
  );

  const material = useLowPolyMaterial(color, {
    metalness: 0.1,
    roughness: 0.9,
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      receiveShadow
    />
  );
};
