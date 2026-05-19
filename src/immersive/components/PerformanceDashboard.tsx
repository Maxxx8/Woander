import React, { useState, useEffect } from 'react';
import { usePerformance } from '../hooks/usePerformance';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import { Activity, Cpu, Monitor, Zap, X } from 'lucide-react';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const { fps, quality, isMonitoring, startMonitoring, stopMonitoring } = usePerformance();
  const { capability, recommendedParticleCount, shouldUse3D, shouldUseHeavyEffects } = useDeviceCapability();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && !isMonitoring) {
      startMonitoring();
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isOpen, isMonitoring, startMonitoring, stopMonitoring]);

  if (!isOpen) return null;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra':
        return 'text-green-500 bg-green-500/10';
      case 'high':
        return 'text-blue-500 bg-blue-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 45) return 'text-yellow-500';
    if (fps >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9998] font-mono">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span className={getFPSColor(fps)}>{fps} FPS</span>
          <span className={`px-2 py-0.5 rounded text-xs ${getQualityColor(quality)}`}>
            {quality.toUpperCase()}
          </span>
        </button>
      ) : (
        <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* FPS Section */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Frame Rate</span>
                <Zap className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-3xl font-bold ${getFPSColor(fps)}`}>
                {fps} FPS
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Target: 60 FPS
              </div>
            </div>

            {/* Quality Section */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Quality Level</span>
                <Monitor className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-xl font-bold px-3 py-1 rounded inline-block ${getQualityColor(quality)}`}>
                {quality.toUpperCase()}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Auto-adjusted based on performance
              </div>
            </div>

            {/* Device Info */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Device Info</span>
                <Cpu className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">GPU Tier:</span>
                  <span className="font-semibold capitalize">{capability?.gpuTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WebGL:</span>
                  <span className="font-semibold">
                    {capability?.isWebGLSupported ? `v${capability.webGLVersion}` : 'Not Supported'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Device:</span>
                  <span className="font-semibold">
                    {capability?.isMobile ? 'Mobile' : capability?.isTablet ? 'Tablet' : 'Desktop'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cores:</span>
                  <span className="font-semibold">{capability?.hardwareConcurrency}</span>
                </div>
                {capability?.deviceMemory && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory:</span>
                    <span className="font-semibold">{capability.deviceMemory} GB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rendering Info */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Rendering Settings</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Particle Count:</span>
                  <span className="font-semibold">{recommendedParticleCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">3D Enabled:</span>
                  <span className={`font-semibold ${shouldUse3D ? 'text-green-500' : 'text-red-500'}`}>
                    {shouldUse3D ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Heavy Effects:</span>
                  <span className={`font-semibold ${shouldUseHeavyEffects ? 'text-green-500' : 'text-red-500'}`}>
                    {shouldUseHeavyEffects ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pixel Ratio:</span>
                  <span className="font-semibold">{capability?.pixelRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Viewport:</span>
                  <span className="font-semibold">
                    {capability?.viewport.width}x{capability?.viewport.height}
                  </span>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Accessibility</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reduced Motion:</span>
                  <span className={`font-semibold ${capability?.prefersReducedMotion ? 'text-yellow-500' : 'text-green-500'}`}>
                    {capability?.prefersReducedMotion ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={onClose}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm transition-colors"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PerformanceToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9998] p-3 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      <PerformanceDashboard isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
