import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSettings } from "@/contexts/SettingsContext";
import { useSpeech } from "@/hooks/useSpeech";
import { Heart, Share2, Copy, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuoteWithCategory } from "@shared/schema";

interface QuoteCardProps {
  quote: QuoteWithCategory;
  variant?: "full" | "compact" | "carousel";
  showActions?: boolean;
  className?: string;
}

const QuoteCard = ({ 
  quote, 
  variant = "full", 
  showActions = true,
  className = ""
}: QuoteCardProps) => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { speak, cancel, isSpeaking } = useSpeech();
  const queryClient = useQueryClient();
  
  const isLoggedIn = Boolean(localStorage.getItem("userId"));
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn) {
        throw new Error("Please log in to save favorites");
      }
      
      if (quote.isFavorite) {
        return apiRequest('DELETE', `/api/favorites/${quote.id}`);
      } else {
        return apiRequest('POST', `/api/favorites`, { quoteId: quote.id });
      }
    },
    onSuccess: () => {
      // Update quote cache
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/random'] });
      
      toast({
        title: quote.isFavorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    }
  });
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" - ${quote.author}`);
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };
  
  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Daily Inspiration",
        text: `"${quote.text}" - ${quote.author}`,
        url: window.location.href,
      }).catch(() => {
        handleCopy();
      });
    } else {
      handleCopy();
      toast({
        title: "Quote copied to clipboard for sharing",
        duration: 2000,
      });
    }
  };
  
  // Handle text-to-speech
  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(`${quote.text} by ${quote.author}`);
    }
  };

  // Styles based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "compact":
        return "p-4";
      case "carousel":
        return "h-full";
      default:
        return "";
    }
  };
  
  const getFontStyles = () => {
    const fontClass = settings?.font === "poppins" 
      ? "font-sans" 
      : "font-serif";
      
    switch (variant) {
      case "compact":
        return `${fontClass} italic text-base`;
      case "carousel":
        return `${fontClass} italic text-lg`;
      default:
        return `${fontClass} italic text-xl leading-relaxed`;
    }
  };
  
  // Render background based on variant
  const renderBackground = () => {
    if (variant === "carousel") {
      return (
        <div 
          className={`gradient-bg-${(quote.id % 3) + 1} p-6 text-white`}
          style={{
            background: getGradientForId(quote.id)
          }}
        >
          <blockquote className={getFontStyles()}>
            "{quote.text}"
          </blockquote>
        </div>
      );
    } else if (variant === "full" && quote.backgroundUrl) {
      return (
        <div 
          className="h-48 bg-center bg-cover" 
          style={{ backgroundImage: `url('${quote.backgroundUrl}')` }}
        ></div>
      );
    }
    
    return null;
  };
  
  // Helper to generate a gradient based on ID
  const getGradientForId = (id: number) => {
    const gradients = [
      "linear-gradient(135deg, #6B8EAE, #95A5A6)",
      "linear-gradient(135deg, #FFB84D, #FFA726)",
      "linear-gradient(135deg, #71C3D7, #6B8EAE)"
    ];
    
    return gradients[id % gradients.length];
  };
  
  return (
    <Card className={`quote-card rounded-custom overflow-hidden shadow-md ${className}`}>
      {renderBackground()}
      
      <CardContent className={`${getCardStyles()} ${!renderBackground() ? "pt-6" : ""} space-y-4`}>
        {variant !== "carousel" && (
          <blockquote className={getFontStyles()}>
            "{quote.text}"
          </blockquote>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{quote.author}</div>
            <div className="text-sm text-secondary">{quote.categoryName}</div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              {settings?.textToSpeech && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-secondary hover:text-primary" 
                  onClick={handleSpeak}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-secondary hover:text-primary" 
                onClick={handleCopy}
              >
                <Copy className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-secondary hover:text-primary" 
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${quote.isFavorite ? 'text-accent' : 'text-secondary hover:text-accent'}`}
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${quote.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
