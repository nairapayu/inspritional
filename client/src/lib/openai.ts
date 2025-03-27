import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openaiInstance: OpenAI | null = null;

/**
 * Get a fallback quote when API generation fails
 * @param prompt The prompt to generate a quote from
 * @returns A pre-defined fallback quote 
 */
function getFallbackQuote(prompt: string): string {
  // Collection of fallback quotes
  const fallbackQuotes = [
    "Every step forward is a step toward achievement.",
    "The key to success is to focus on goals, not obstacles.",
    "Your potential is the sum of all possibilities you have yet to explore.",
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "You are capable of more than you know.",
    "The only way to do great work is to love what you do.",
    "Challenges are what make life interesting. Overcoming them is what makes life meaningful."
  ];
  
  // Find a quote that contains keyword from prompt if possible
  const keywordMatch = prompt.match(/about\s+(\w+)/i) || prompt.match(/(\w+)/i);
  const keyword = keywordMatch ? keywordMatch[1].toLowerCase() : "";
  
  let selectedQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  
  // Try to find a quote that contains the keyword
  const matchingQuotes = fallbackQuotes.filter(quote => 
    quote.toLowerCase().includes(keyword)
  );
  
  if (matchingQuotes.length > 0) {
    selectedQuote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
  }
  
  return selectedQuote;
}

// Create a configurable OpenAI instance
export function configureOpenAI(apiKey: string) {
  if (!apiKey) return null;
  
  // Validate API key format (OpenAI keys typically start with "sk-")
  if (!apiKey.startsWith("sk-")) {
    console.warn("Provided API key does not appear to be a valid OpenAI key (should start with 'sk-')");
    return null;
  }
  
  try {
    openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Allow client-side usage for frontend generation
    });
    
    return openaiInstance;
  } catch (error) {
    console.error("Error initializing OpenAI client:", error);
    return null;
  }
}

// Get the configured OpenAI instance
export function getOpenAIInstance() {
  return openaiInstance;
}

/**
 * Generate a motivational quote using OpenAI
 * @param prompt The prompt to generate a quote from
 * @param model The model to use for generation
 * @returns The generated quote text
 */
export async function generateMotivationalQuote(prompt: string, model: string = "gpt-4o"): Promise<string> {
  const openai = getOpenAIInstance();
  if (!openai) {
    console.warn("OpenAI is not configured. Using fallback quote generation.");
    return getFallbackQuote(prompt);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model, // Use the model from settings or default to gpt-4o
      messages: [
        {
          role: "system",
          content: "You are a motivational quotes generator. Create an original, inspiring quote based on the given prompt. Keep it concise (under 150 characters) and profound. Do not include any quotation marks in your response. Just return the quote text and nothing else."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() || 
      "Your potential is the sum of all the possibilities you have yet to explore.";
  } catch (error) {
    console.error("Error generating quote with OpenAI:", error);
    return getFallbackQuote(prompt);
  }
}

/**
 * Generate a similar quote based on an existing one
 * @param existingQuote The quote to generate a similar one from
 * @param model The model to use for generation
 * @returns The generated similar quote
 */
export async function generateSimilarQuote(existingQuote: string, model: string = "gpt-4o"): Promise<string> {
  const openai = getOpenAIInstance();
  if (!openai) {
    console.warn("OpenAI is not configured. Using fallback quote generation.");
    return getFallbackQuote(`similar to: ${existingQuote}`);
  }
  
  try {
    const prompt = `Create a new motivational quote similar in theme and style to this one, but not too similar: "${existingQuote}"`;
    
    const completion = await openai.chat.completions.create({
      model: model, // Use the model from settings or default to gpt-4o
      messages: [
        {
          role: "system",
          content: "You are a motivational quotes generator. Create an original, inspiring quote similar to the one provided, but distinct and unique. Keep it concise (under 150 characters) and profound. Do not include any quotation marks in your response. Just return the quote text and nothing else."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return completion.choices[0].message.content?.trim() || 
      "Every challenge you face is a stepping stone on the path to your greatest achievements.";
  } catch (error) {
    console.error("Error generating similar quote with OpenAI:", error);
    return getFallbackQuote(`similar to: ${existingQuote}`);
  }
}