import React, { useState, useEffect } from 'react';
import { Download, X, Share, Plus, Square, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Don't show modal if already installed
    if (standalone) {
      return;
    }

    // Check if user has previously dismissed the modal
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      return;
    }

    // For Chrome/Edge - listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show modal for all browsers after a delay (not just iOS)
    setTimeout(() => setShowModal(true), 1000);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!isIOS && deferredPrompt) {
      // Chrome/Edge - trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowModal(false);
        localStorage.setItem('installPromptDismissed', 'true');
      }

      setDeferredPrompt(null);
    }
    // For iOS, the modal already shows instructions, so just keep it open
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showModal || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="relative bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl max-w-md w-full mx-4 mb-0 sm:mb-4 animate-pulse-in">
        {/* Handle bar for mobile */}
        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-6 right-6 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
            <Smartphone size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Add to Home Screen</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Quick and easy!</p>
          </div>
        </div>

        {isIOS ? (
          // iOS Safari Instructions
          <div className="space-y-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-semibold">
              Just follow these 3 easy steps:
            </p>

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-400 font-bold">1</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Tap the Share button
                </p>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <Share size={20} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Located at the bottom of Safari
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-400 font-bold">2</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Select "Add to Home Screen"
                </p>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <Plus size={20} className="text-primary-600 dark:text-primary-400" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Scroll down in the share menu
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-700 dark:text-primary-400 font-bold">3</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Tap "Add" to confirm
                </p>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <Square size={20} className="text-primary-600 dark:text-primary-400 fill-current" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Pulse will appear on your home screen
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <button
              onClick={handleDismiss}
              className="w-full mt-4 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold text-base hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Got it!
            </button>
          </div>
        ) : (
          // Chrome/Edge Install
          <div className="space-y-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add Pulse to your home screen for easy access. Works even without internet!
            </p>

            {/* File Size Info */}
            <div className="flex items-center justify-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                📦 Super small • Takes almost no space
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl font-bold text-base hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-bold text-base hover:shadow-lg transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
