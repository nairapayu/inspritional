import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useQuotes } from "@/contexts/QuoteContext";
import { Skeleton } from "@/components/ui/skeleton";
import QuoteCard from "@/components/QuoteCard";
import QuoteActions from "@/components/QuoteActions";
import QuoteGenerator from "@/components/QuoteGenerator";
import CategoryButtons from "@/components/CategoryButtons";
import type { QuoteWithCategory } from "@shared/schema";

const DailyQuoteTab = () => {
  const { dailyQuote, setDailyQuote } = useQuotes();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Fetch random quote
  const { 
    data: quote, 
    isLoading, 
    isError, 
    refetch,
    isRefetching
  } = useQuery<QuoteWithCategory>({
    queryKey: ['/api/quotes/random'],
    enabled: !dailyQuote,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  // Update daily quote when data is fetched
  if (quote && !dailyQuote) {
    setDailyQuote(quote);
  }
  
  // Refresh quote handler
  const handleRefreshQuote = async () => {
    const result = await refetch();
    if (result.data) {
      setDailyQuote(result.data);
    }
  };
  
  // If still loading or error, show appropriate UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-medium text-textColor">Your Daily Inspiration</h2>
            <p className="text-secondary text-sm">{today}</p>
          </div>
          
          <div className="rounded-custom bg-white shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-medium text-textColor">Your Daily Inspiration</h2>
            <p className="text-secondary text-sm">{today}</p>
          </div>
          
          <div className="rounded-custom bg-white shadow-md overflow-hidden p-6 text-center">
            <p className="text-red-500">Failed to load quote. Please try again.</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-custom"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle new generated quote
  const handleQuoteGenerated = (quote: QuoteWithCategory) => {
    setDailyQuote(quote);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-medium text-textColor">Your Daily Inspiration</h2>
          <p className="text-secondary text-sm">{today}</p>
        </div>
        
        {dailyQuote && (
          <>
            <QuoteCard quote={dailyQuote} />
            
            <QuoteActions 
              quote={dailyQuote} 
              onRefresh={handleRefreshQuote}
              isRefreshing={isRefetching}
            />
          </>
        )}
        
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium">Filter by Category</h3>
          <CategoryButtons 
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
        
        <div className="mt-8">
          <QuoteGenerator 
            categoryId={selectedCategoryId}
            onQuoteGenerated={handleQuoteGenerated}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyQuoteTab;
