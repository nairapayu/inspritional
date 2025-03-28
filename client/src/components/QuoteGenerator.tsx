import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { QuoteWithCategory } from "@shared/schema";

interface QuoteGeneratorProps {
  categoryId?: number | null;
  onQuoteGenerated?: (quote: QuoteWithCategory) => void;
}

const QuoteGenerator = ({ categoryId, onQuoteGenerated }: QuoteGeneratorProps) => {
  const [keyword, setKeyword] = useState("");
  const { toast } = useToast();
  
  // Generate new AI quote
  const generateQuoteMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create an inspirational quote about ${keyword}`;
      return apiRequest('POST', '/api/quotes/generate', { 
        prompt,
        category: categoryId 
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Quote generated",
        description: "New quote created successfully"
      });
      
      // Invalidate quotes cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      
      // Notify parent component
      if (onQuoteGenerated && data) {
        onQuoteGenerated(data as unknown as QuoteWithCategory);
      }
      
      // Clear the input field
      setKeyword("");
    },
    onError: (error: any) => {
      // Extract error details from the response if available
      const errorData = error.response?.data || {};
      const errorCode = errorData.code || '';
      const errorMessage = errorData.message || error.message || "An unexpected error occurred";
      
      // Create a more user-friendly message based on the error type
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("quota") || errorCode === "insufficient_quota") {
        userFriendlyMessage = "API quota exceeded. Please try again later or update your API key in settings.";
      } else if (errorMessage.includes("API key") || errorCode === "invalid_api_key") {
        userFriendlyMessage = "Invalid API key. Please update your OpenAI API key in settings.";
      } else if (errorMessage.includes("not available")) {
        userFriendlyMessage = "Quote generation will use built-in quotes until an OpenAI API key is provided.";
      }
      
      toast({
        title: "Quote Generator Notice",
        description: userFriendlyMessage,
        variant: errorMessage.includes("not available") ? "default" : "destructive"
      });
    }
  });
  
  return (
    <Card className="rounded-lg shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Quick Quote Generator
        </CardTitle>
        <CardDescription>
          Generate a motivational quote on any topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a word or topic..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => generateQuoteMutation.mutate()}
            disabled={generateQuoteMutation.isPending || !keyword.trim()}
            className="bg-primary text-white"
          >
            {generateQuoteMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteGenerator;