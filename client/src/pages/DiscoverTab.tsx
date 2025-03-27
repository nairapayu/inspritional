import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CategoryButtons from "@/components/CategoryButtons";
import QuoteCarousel from "@/components/QuoteCarousel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuoteCard from "@/components/QuoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, RefreshCw } from "lucide-react";
import type { QuoteWithCategory, Category } from "@shared/schema";

const DiscoverTab = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState("Create a motivational quote about overcoming challenges");
  const { toast } = useToast();
  
  // Fetch featured quotes
  const { 
    data: featuredQuotes = [],
    isLoading: isLoadingFeatured,
    refetch: refetchFeatured
  } = useQuery<QuoteWithCategory[]>({
    queryKey: ['/api/quotes'],
  });
  
  // Fetch AI quote
  const { 
    data: aiQuote,
    isLoading: isLoadingAI,
    refetch: refetchAI
  } = useQuery<QuoteWithCategory>({
    queryKey: ['/api/quotes', 'ai'],
    queryFn: async () => {
      // Find AI-generated quotes from featured quotes
      const aiQuotes = featuredQuotes.filter(q => q.isAiGenerated);
      if (aiQuotes.length > 0) {
        return aiQuotes[0];
      }
      
      // If no AI quotes found, fetch a random one
      const response = await fetch('/api/quotes/random');
      if (!response.ok) {
        throw new Error('Failed to fetch AI quote');
      }
      return response.json();
    },
    enabled: !isLoadingFeatured,
  });
  
  // Generate new AI quote
  const generateAiQuoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/quotes/generate', { 
        prompt: aiPrompt,
        category: selectedCategoryId 
      });
    },
    onSuccess: (data) => {
      toast({
        title: "New quote generated",
        description: "AI has created a new inspirational quote for you",
      });
      
      // Refetch quotes to update the list
      refetchFeatured();
    },
    onError: (error) => {
      toast({
        title: "Error generating quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter quotes by selected category
  const filteredQuotes = selectedCategoryId 
    ? featuredQuotes.filter(quote => quote.categoryId === selectedCategoryId)
    : featuredQuotes;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-8">
        {/* Categories Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-textColor">Browse Categories</h2>
          <CategoryButtons 
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        {/* Quote Carousel */}
        <div className="space-y-4">
          {isLoadingFeatured ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-40" />
                <div className="flex space-x-1">
                  <Skeleton className="h-2 w-6 rounded-full" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-custom" />
            </div>
          ) : (
            <QuoteCarousel 
              quotes={filteredQuotes} 
              title="Featured Quotes"
              onRefresh={() => refetchFeatured()}
            />
          )}
        </div>

        {/* AI Generated Quotes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-textColor">AI Powered Quotes</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-opacity-80 text-sm font-medium flex items-center gap-1"
              onClick={() => refetchAI()}
              disabled={isLoadingAI}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAI ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {isLoadingAI ? (
            <Skeleton className="h-48 w-full rounded-custom" />
          ) : aiQuote ? (
            <Card className="rounded-custom shadow-md overflow-hidden border-l-4 border-accent">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Lightbulb className="h-5 w-5" />
                  <span className="font-medium">AI Generated</span>
                </div>
                
                <blockquote className="font-serif italic text-lg leading-relaxed">
                  "{aiQuote.text}"
                </blockquote>
                
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => {
                      setAiPrompt(`Create a quote similar to: ${aiQuote.text}`);
                      generateAiQuoteMutation.mutate();
                    }}
                    disabled={generateAiQuoteMutation.isPending}
                  >
                    Generate Similar
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="p-2 text-secondary hover:text-primary rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`"${aiQuote.text}" - ${aiQuote.author}`);
                        toast({
                          title: "Copied to clipboard",
                          duration: 2000,
                        });
                      }}
                    >
                      <i className="bx bx-copy"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-custom shadow-md overflow-hidden">
              <CardContent className="p-6">
                <p>No AI-generated quote available. Generate one below.</p>
              </CardContent>
            </Card>
          )}
          
          <Card className="rounded-custom shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle>Generate Your Own Quote</CardTitle>
              <CardDescription>
                Use AI to create a custom motivational quote based on your prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter a prompt for the AI to generate a quote..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className="bg-primary text-white"
                onClick={() => generateAiQuoteMutation.mutate()}
                disabled={generateAiQuoteMutation.isPending || !aiPrompt.trim()}
              >
                {generateAiQuoteMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate Quote
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiscoverTab;
