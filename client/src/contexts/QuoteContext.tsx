import { createContext, useContext, useState, ReactNode } from "react";
import type { QuoteWithCategory } from "@shared/schema";

interface QuoteContextType {
  dailyQuote: QuoteWithCategory | null;
  setDailyQuote: (quote: QuoteWithCategory) => void;
  featuredQuotes: QuoteWithCategory[];
  setFeaturedQuotes: (quotes: QuoteWithCategory[]) => void;
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
  const [dailyQuote, setDailyQuote] = useState<QuoteWithCategory | null>(null);
  const [featuredQuotes, setFeaturedQuotes] = useState<QuoteWithCategory[]>([]);

  return (
    <QuoteContext.Provider
      value={{
        dailyQuote,
        setDailyQuote,
        featuredQuotes,
        setFeaturedQuotes,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
