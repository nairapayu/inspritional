import { format } from "date-fns";
import type { QuoteWithCategory } from "@shared/schema";

/**
 * Formats a quote for display
 * @param quote The quote to format
 * @returns The formatted quote text with author
 */
export function formatQuote(quote: QuoteWithCategory): string {
  return `"${quote.text}" — ${quote.author}`;
}

/**
 * Creates a shareable URL for a quote
 * @param quote The quote to create a URL for
 * @returns A shareable URL
 */
export function createShareableLink(quote: QuoteWithCategory): string {
  const baseUrl = window.location.origin;
  const encodedText = encodeURIComponent(quote.text);
  const encodedAuthor = encodeURIComponent(quote.author);
  
  return `${baseUrl}/#share?text=${encodedText}&author=${encodedAuthor}&id=${quote.id}`;
}

/**
 * Generate gradient backgrounds for quotes
 * @param id Quote ID or other identifier
 * @returns CSS gradient string
 */
export function getGradientForId(id: number): string {
  const gradients = [
    "linear-gradient(135deg, #6B8EAE, #95A5A6)", // Serene blue to muted grey
    "linear-gradient(135deg, #FFB84D, #FFA726)", // Warm orange
    "linear-gradient(135deg, #71C3D7, #6B8EAE)", // Blue tones
    "linear-gradient(135deg, #2C3E50, #4CA1AF)", // Deep navy to teal
    "linear-gradient(135deg, #606c88, #3f4c6b)"  // Slate
  ];
  
  return gradients[id % gradients.length];
}

/**
 * Get today's date in a readable format
 * @returns Today's date as a string
 */
export function getTodayFormatted(): string {
  return format(new Date(), "EEEE, MMMM d, yyyy");
}

/**
 * Filter quotes by search query
 * @param quotes List of quotes to filter
 * @param query Search query
 * @returns Filtered quotes
 */
export function filterQuotesByQuery(quotes: QuoteWithCategory[], query: string): QuoteWithCategory[] {
  if (!query.trim()) return quotes;
  
  const lowerQuery = query.toLowerCase();
  
  return quotes.filter(quote => 
    quote.text.toLowerCase().includes(lowerQuery) || 
    quote.author.toLowerCase().includes(lowerQuery) ||
    (quote.categoryName && quote.categoryName.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Group quotes by category
 * @param quotes List of quotes to group
 * @returns Record of category name to quotes
 */
export function groupQuotesByCategory(quotes: QuoteWithCategory[]): Record<string, QuoteWithCategory[]> {
  return quotes.reduce((grouped, quote) => {
    const category = quote.categoryName || "Uncategorized";
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(quote);
    return grouped;
  }, {} as Record<string, QuoteWithCategory[]>);
}

/**
 * Share a quote using the Web Share API if available
 * @param quote The quote to share
 * @returns Promise resolving to whether the share was successful
 */
export async function shareQuote(quote: QuoteWithCategory): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title: "Daily Inspiration",
      text: formatQuote(quote),
      url: createShareableLink(quote)
    });
    return true;
  } catch (error) {
    console.error("Error sharing quote:", error);
    return false;
  }
}

/**
 * Copy quote to clipboard
 * @param quote The quote to copy
 * @returns Promise resolving to whether the copy was successful
 */
export async function copyQuoteToClipboard(quote: QuoteWithCategory): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatQuote(quote));
    return true;
  } catch (error) {
    console.error("Error copying quote to clipboard:", error);
    return false;
  }
}
