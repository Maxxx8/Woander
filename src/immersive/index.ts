// Components
export { AccessibilityProvider, useAccessibility } from './components/AccessibilityProvider';
export { ParticleUniverse } from './components/ParticleUniverse';
export { SmoothScroll } from './components/SmoothScroll';
export { ImmersiveHero } from './components/ImmersiveHero';
export { Interactive3DGemCard } from './components/Interactive3DGemCard';
export { AnimatedButton } from './components/AnimatedButton';
export { TiltCard3D } from './components/TiltCard3D';
export { ParticleTransition, ImageParticleDissolve } from './components/ParticleTransition';
export { MagneticCursor, MagneticElement } from './components/MagneticCursor';
export { PerformanceDashboard, PerformanceToggle } from './components/PerformanceDashboard';

// Hooks
export { usePerformance } from './hooks/usePerformance';
export { useDeviceCapability } from './hooks/useDeviceCapability';
export { useReducedMotion } from './hooks/useReducedMotion';
export {
  useScrollAnimation,
  useFadeInScroll,
  useParallaxScroll,
  useScaleInScroll,
  useStaggerScroll,
} from './hooks/useScrollAnimation';

// Utilities
export { PerformanceMonitor, createPerformanceMonitor } from './utils/performanceMonitor';
export { DeviceCapabilityDetector, deviceCapability } from './utils/deviceCapability';

// Audio
export { AudioManager, initializeAudio } from './audio/AudioManager';
export type { SoundCategory } from './audio/AudioManager';

// Materials
export {
  useLowPolyMaterial,
  useLowPolyGlassMaterial,
  useLowPolyMetallicMaterial,
  LowPolyShape,
  LowPolyTerrain,
  generateLowPolyTerrain,
} from './materials/LowPolyMaterials';

// Types
export type { QualityLevel } from './utils/performanceMonitor';
export type { DeviceCapability } from './utils/deviceCapability';
