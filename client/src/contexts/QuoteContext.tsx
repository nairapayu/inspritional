import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { QuoteWithCategory } from "@shared/schema";
import { 
  saveDailyQuoteOffline, 
  getDailyQuoteOffline,
  saveFeaturedQuotesOffline,
  getFeaturedQuotesOffline,
  registerOfflineListeners,
  isOffline,
  updateLastSync
} from "@/lib/offlineQuotes";
import { useToast } from "@/hooks/use-toast";

interface QuoteContextType {
  dailyQuote: QuoteWithCategory | null;
  setDailyQuote: (quote: QuoteWithCategory) => void;
  featuredQuotes: QuoteWithCategory[];
  setFeaturedQuotes: (quotes: QuoteWithCategory[]) => void;
  isOfflineMode: boolean;
  syncOfflineData: () => void;
}

const QuoteContext = createContext<QuoteContextType | null>(null);

export const useQuotes = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuotes must be used within a QuoteContextProvider");
  }
  return context;
};

interface QuoteContextProviderProps {
  children: ReactNode;
}

export const QuoteContextProvider = ({ children }: QuoteContextProviderProps) => {
  const [dailyQuote, setDailyQuoteState] = useState<QuoteWithCategory | null>(() => getDailyQuoteOffline());
  const [featuredQuotes, setFeaturedQuotesState] = useState<QuoteWithCategory[]>(() => getFeaturedQuotesOffline());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => isOffline());
  const { toast } = useToast();

  // Handle setting daily quote with offline persistence
  const setDailyQuote = (quote: QuoteWithCategory) => {
    setDailyQuoteState(quote);
    saveDailyQuoteOffline(quote);
  };

  // Handle setting featured quotes with offline persistence
  const setFeaturedQuotes = (quotes: QuoteWithCategory[]) => {
    setFeaturedQuotesState(quotes);
    saveFeaturedQuotesOffline(quotes);
  };

  // Sync offline data with server when coming back online
  const syncOfflineData = () => {
    // This function would normally make API calls to sync data with the server
    // For now, we'll just update the last sync timestamp
    updateLastSync();
  };

  // Register online/offline event listeners
  useEffect(() => {
    const handleOffline = () => {
      setIsOfflineMode(true);
      toast({
        title: "You are offline",
        description: "App will continue to work with saved quotes",
        variant: "default",
      });
    };

    const handleOnline = () => {
      setIsOfflineMode(false);
      syncOfflineData();
      toast({
        title: "You are back online",
        description: "Syncing your quotes",
        variant: "default",
      });
    };

    // Initial check
    if (isOffline()) {
      handleOffline();
    }

    return registerOfflineListeners(handleOffline, handleOnline);
  }, [toast]);

  return (
    <QuoteContext.Provider
      value={{
        dailyQuote,
        setDailyQuote,
        featuredQuotes,
        setFeaturedQuotes,
        isOfflineMode,
        syncOfflineData
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
