import { RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import type { QuoteWithCategory } from "@shared/schema";

interface QuoteActionsProps {
  quote: QuoteWithCategory;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const QuoteActions = ({ quote, onRefresh, isRefreshing }: QuoteActionsProps) => {
  const { speak } = useSpeech();
  
  const handleSpeak = () => {
    speak(`${quote.text} by ${quote.author}`);
  };
  
  return (
    <div className="flex justify-center space-x-4 mt-6">
      <Button 
        variant="outline" 
        className="px-5 py-3 rounded-custom shadow-sm text-primary font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>New Quote</span>
      </Button>
      
      <Button 
        className="bg-primary px-5 py-3 rounded-custom shadow-sm text-white font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
        onClick={handleSpeak}
      >
        <Volume2 className="h-5 w-5" />
        <span>Listen</span>
      </Button>
    </div>
  );
};

export default QuoteActions;
