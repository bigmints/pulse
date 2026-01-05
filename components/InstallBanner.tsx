import React, { useState, useEffect } from 'react';
import { Download, X, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallBannerProps {
    inline?: boolean; // If true, render as inline component instead of fixed header
}

const InstallBanner: React.FC<InstallBannerProps> = ({ inline = false }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Check if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // If running as PWA, don't show anything
        if (isStandalone) {
            setShowBanner(false);
            return;
        }

        // Check if PWA is installed (but we're in browser)
        // We can detect this by checking if the app was previously installed
        const wasInstalled = localStorage.getItem('pwaInstalled') === 'true';
        setIsInstalled(wasInstalled);

        // Check if user dismissed the modal
        const dismissed = localStorage.getItem('installPromptDismissed');

        // Check if user dismissed the banner
        const bannerDismissed = localStorage.getItem('installBannerDismissed');

        // Show banner if: (dismissed modal OR installed) AND not dismissed banner AND not running as PWA
        if ((dismissed || wasInstalled) && !bannerDismissed) {
            setShowBanner(true);
        }

        // Listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            localStorage.setItem('pwaInstalled', 'true');
            setIsInstalled(true);
            setShowBanner(true); // Show "Open the app" message
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setShowBanner(false);
                localStorage.removeItem('installPromptDismissed');
                localStorage.setItem('pwaInstalled', 'true');
            }

            setDeferredPrompt(null);
        }
    };

    const handleDismissBanner = () => {
        setShowBanner(false);
        localStorage.setItem('installBannerDismissed', 'true');
    };

    if (!showBanner) {
        return null;
    }

    const bannerContent = (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg rounded-[28px]">
            <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {isInstalled ? (
                        <>
                            <ExternalLink size={18} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">
                                Open Pulse app for the best experience!
                            </p>
                        </>
                    ) : (
                        <>
                            <Download size={18} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">
                                Add Pulse to your home screen for quick access!
                            </p>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isInstalled ? (
                        <a
                            href="/"
                            className="px-4 py-1.5 bg-white text-primary-700 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors"
                        >
                            Open App
                        </a>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="px-4 py-1.5 bg-white text-primary-700 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors"
                        >
                            Add Now
                        </button>
                    )}
                    <button
                        onClick={handleDismissBanner}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );

    if (inline) {
        return <div className="mt-6">{bannerContent}</div>;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[90]">
            {bannerContent}
        </div>
    );
};

export default InstallBanner;
