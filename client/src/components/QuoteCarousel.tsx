import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuoteCard from "./QuoteCard";
import type { QuoteWithCategory } from "@shared/schema";

interface QuoteCarouselProps {
  quotes: QuoteWithCategory[];
  title: string;
  onRefresh?: () => void;
}

const QuoteCarousel = ({ quotes, title, onRefresh }: QuoteCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Reset active index when quotes change
  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [quotes]);
  
  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      scrollToIndex(activeIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (activeIndex < quotes.length - 1) {
      setActiveIndex(activeIndex + 1);
      scrollToIndex(activeIndex + 1);
    }
  };
  
  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollLeft = index * itemWidth;
    }
  };
  
  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
  };
  
  // Handle scroll events to update active index
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };
  
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => {
        carousel.removeEventListener('scroll', handleScroll);
      };
    }
  }, [activeIndex]);
  
  if (!quotes.length) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-textColor">{title}</h2>
        <div className="flex space-x-1">
          {quotes.map((_, i) => (
            <button
              key={i}
              className={`carousel-indicator h-2 rounded-full transition-all ${
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-gray-300"
              }`}
              onClick={() => handleIndicatorClick(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md z-10 hover:bg-gray-50"
          onClick={handlePrev}
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </Button>

        <div 
          ref={carouselRef}
          className="quote-carousel flex overflow-x-auto gap-4 py-4 px-2 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
        >
          {quotes.map((quote) => (
            <div 
              key={quote.id} 
              className="quote-carousel-item flex-shrink-0 w-full snap-start"
            >
              <QuoteCard 
                quote={quote} 
                variant="carousel" 
              />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md z-10 hover:bg-gray-50"
          onClick={handleNext}
          disabled={activeIndex === quotes.length - 1}
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-opacity-80 text-sm font-medium flex items-center gap-1"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      )}
    </div>
  );
};

import { RefreshCw } from "lucide-react";

export default QuoteCarousel;
