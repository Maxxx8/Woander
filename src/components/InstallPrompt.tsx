import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!showPrompt || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Download className="h-6 w-6 text-teal-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Install Woander App
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get the full app experience with offline access and notifications
          </p>
          <div className="flex space-x-2">
            <button
              onClick={installApp}
              className="bg-gradient-to-r from-coral-500 to-coral-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-coral-600 hover:to-coral-700 transition-all shadow-sm"
            >
              Install
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-gray-500 px-3 py-1.5 rounded text-xs font-medium hover:text-gray-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;