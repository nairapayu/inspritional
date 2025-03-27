import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, XIcon, SmartphoneIcon } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import useUserAgent from '@/hooks/useUserAgent';

// For TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPromotion, setShowInstallPromotion] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isIOS, isAndroid, isMobile, isStandalone } = useUserAgent();

  useEffect(() => {
    // Check if the app is already installed
    if (isStandalone) {
      // App is already installed, no need to show the prompt
      return;
    }

    // Check if user has dismissed the promotion before
    const hasDismissedPromotion = localStorage.getItem('pwaPromptDismissed');
    if (hasDismissedPromotion) {
      setDismissed(true);
      return;
    }

    // Special handling for iOS (which doesn't support beforeinstallprompt)
    if (isIOS && isMobile) {
      setShowIOSInstructions(true);
      setShowInstallPromotion(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install promotion
      setShowInstallPromotion(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS, isAndroid, isMobile, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // User accepted, hide our promotion
    if (outcome === 'accepted') {
      setShowInstallPromotion(false);
    }
    
    // Clear the saved prompt as it can't be used again
    setDeferredPrompt(null);
  };

  const dismissPromotion = () => {
    setShowInstallPromotion(false);
    setDismissed(true);
    // Remember this choice for 7 days
    localStorage.setItem('pwaPromptDismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwaPromptDismissed');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  };

  if (!showInstallPromotion || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-50">
      <Card className="shadow-lg border-[var(--color-primary)]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-[var(--color-primary)]">
              {showIOSInstructions ? "Install on iOS" : "Install App"}
            </CardTitle>
            <button 
              onClick={dismissPromotion} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Dismiss"
            >
              <XIcon size={18} />
            </button>
          </div>
          <CardDescription>
            {showIOSInstructions 
              ? "Add this app to your home screen for the best experience" 
              : "Install this app on your device for a better experience"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm pb-2">
          {showIOSInstructions ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <SmartphoneIcon size={16} className="mr-2 text-[var(--color-primary)]" />
                <span>Tap the share icon <span className="font-bold">􀈂</span> in Safari</span>
              </div>
              <div className="flex items-center">
                <DownloadIcon size={16} className="mr-2 text-[var(--color-primary)]" />
                <span>Tap "Add to Home Screen"</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 w-4 h-4 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-xs">✓</span>
                <span>Tap "Add" in the top right</span>
              </div>
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              <li>Works offline</li>
              <li>Faster access to your quotes</li>
              <li>No browser interface</li>
            </ul>
          )}
        </CardContent>
        <CardFooter>
          {!showIOSInstructions && (
            <Button 
              onClick={handleInstallClick} 
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
            >
              <DownloadIcon size={16} className="mr-2" />
              Install Now
            </Button>
          )}
          {showIOSInstructions && (
            <Button 
              onClick={dismissPromotion}
              variant="outline" 
              className="w-full border-[var(--color-primary)] text-[var(--color-primary)]"
            >
              Got it
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InstallPWA;