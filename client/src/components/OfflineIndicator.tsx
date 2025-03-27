import { useQuotes } from "@/contexts/QuoteContext";
import { WifiOffIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";

const OfflineIndicator = () => {
  const { isOfflineMode } = useQuotes();
  const [visible, setVisible] = useState(false);

  // Show the indicator when offline and hide after 5 seconds
  useEffect(() => {
    if (isOfflineMode) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOfflineMode]);

  if (!visible) return null;
  
  return (
    <div className="fixed bottom-24 left-0 right-0 mx-auto w-[90%] max-w-md z-40 transition-all duration-300">
      <Alert 
        variant="destructive" 
        className="border-yellow-500 bg-yellow-50 text-yellow-800 flex items-center py-2"
      >
        <WifiOffIcon className="h-4 w-4 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium">Offline Mode</AlertTitle>
          <AlertDescription className="text-xs">
            You're viewing cached content. Some features may be limited.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;