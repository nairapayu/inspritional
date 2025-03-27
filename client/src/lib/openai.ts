import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openaiInstance: OpenAI | null = null;

// Create a configurable OpenAI instance
export function configureOpenAI(apiKey: string) {
  if (!apiKey) return null;
  
  openaiInstance = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Allow client-side usage for frontend generation
  });
  
  return openaiInstance;
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
    throw new Error("OpenAI is not configured. Please provide an API key in the settings.");
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
    throw new Error("Failed to generate quote. Please check your API key and try again.");
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
    throw new Error("OpenAI is not configured. Please provide an API key in the settings.");
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
    throw new Error("Failed to generate similar quote. Please check your API key and try again.");
  }
}
