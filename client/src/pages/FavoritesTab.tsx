import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import QuoteCard from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import type { QuoteWithCategory } from "@shared/schema";

const FavoritesTab = () => {
  const [sortBy, setSortBy] = useState<"recent" | "author" | "category">("recent");
  const [page, setPage] = useState(1);
  const limit = 6; // Items per page
  
  // Fetch favorites
  const { 
    data: favorites = [], 
    isLoading, 
    isError 
  } = useQuery<QuoteWithCategory[]>({
    queryKey: ['/api/favorites'],
  });
  
  // Sort favorites based on selected option
  const getSortedFavorites = () => {
    if (!favorites) return [];
    
    const sorted = [...favorites];
    
    switch (sortBy) {
      case "author":
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      case "category":
        return sorted.sort((a, b) => {
          const catA = a.categoryName || "";
          const catB = b.categoryName || "";
          return catA.localeCompare(catB);
        });
      case "recent":
      default:
        return sorted; // Assuming API returns most recent first
    }
  };
  
  // Paginate favorites
  const paginatedFavorites = () => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return getSortedFavorites().slice(start, end);
  };
  
  // Check if there are more pages
  const hasMore = favorites.length > page * limit;
  
  // Handle load more
  const handleLoadMore = () => {
    setPage(page + 1);
  };
  
  // Navigate to Discover tab if no favorites
  const goToDiscover = () => {
    window.location.hash = "discover";
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-textColor">My Favorite Quotes</h2>
          <Skeleton className="h-10 w-36" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-custom" />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-16 bg-white rounded-custom shadow-sm">
          <div className="text-red-500 mb-2">Failed to load favorites</div>
          <Button 
            variant="default" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-16 bg-white rounded-custom shadow-sm">
          <div className="flex justify-center">
            <Heart className="h-16 w-16 text-gray-200" />
          </div>
          <h3 className="mt-4 font-medium text-lg">No favorites yet</h3>
          <p className="text-secondary mt-2">Save your favorite quotes to access them anytime</p>
          <Button 
            variant="default" 
            className="mt-4 bg-primary text-white"
            onClick={goToDiscover}
          >
            Explore Quotes
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-textColor">My Favorite Quotes</h2>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "recent" | "author" | "category")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="author">By Author</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedFavorites().map((quote) => (
            <QuoteCard 
              key={quote.id} 
              quote={quote} 
              variant="compact" 
            />
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline"
              className="px-4 py-2 bg-white rounded-full border border-gray-200 text-primary font-medium hover:bg-gray-50"
              onClick={handleLoadMore}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesTab;
