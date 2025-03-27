import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuoteSchema, 
  insertCategorySchema, 
  insertFavoriteSchema,
  insertUserSchema,
  insertSettingsSchema,
  aiSettingsSchema
} from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";

// Extend Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
    tempSettings?: {
      theme: string;
      font: string;
      language: string;
      textToSpeech: boolean;
      enableNotifications: boolean;
      selectedCategories: string[];
      apiKey?: string;
      aiModel?: string;
      defaultPrompt?: string;
      [key: string]: any;
    };
  }
}

// Initialize OpenAI API with environment variable
let openaiInstance: OpenAI | null = null;
let customApiKey: string | null = null;

// Debug: Log the API key format (safely)
if (process.env.OPENAI_API_KEY) {
  const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 7);
  const keyLength = process.env.OPENAI_API_KEY.length;
  console.log(`OpenAI API key found. Format: ${keyPrefix}...${keyLength} chars`);
} else {
  console.error("No OpenAI API key found in environment variables");
}

try {
  openaiInstance = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log("OpenAI client initialized successfully");
} catch (err) {
  console.error("Error initializing OpenAI:", err);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleError = (err: any, res: Response) => {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    return res.status(500).json({ message: err.message || "Internal server error" });
  };

  /**
   * User Routes
   */
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (err) {
      return handleError(err, res);
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user in session (simplified for demo)
      if (!req.session) {
        return res.status(500).json({ message: "Session not available" });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin || false;
      
      return res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } catch (err) {
      return handleError(err, res);
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Not logged in" });
    }
  });
  
  app.get("/api/me", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not logged in" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      });
    } catch (err) {
      return handleError(err, res);
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Make sure the user can only get their own profile
      if (req.session?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this profile" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the user's settings
      const settings = await storage.getSettings(userId);
      
      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        language: settings?.language || "en",
        enableNotifications: settings?.enableNotifications || false,
        theme: settings?.theme || "light",
        font: settings?.font || "playfair"
      });
    } catch (err) {
      return handleError(err, res);
    }
  });
  
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Make sure the user can only update their own profile
      if (req.session?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      
      const { username, theme, font, language, textToSpeech, enableNotifications, selectedCategories } = req.body;
      
      // Update username if provided
      if (username) {
        // For now, we'll skip implementation since we're using MemStorage
        // In a real app, you would update the user's username here
      }
      
      // Update user settings
      await storage.createOrUpdateSettings(userId, {
        theme: theme || "light",
        font: font || "playfair",
        language: language || "en",
        textToSpeech: textToSpeech || false,
        enableNotifications: enableNotifications || false,
        selectedCategories: selectedCategories || []
      });
      
      res.json({
        success: true,
        message: "Profile updated successfully"
      });
    } catch (err) {
      return handleError(err, res);
    }
  });

  /**
   * Quote Routes
   */
  app.get("/api/quotes", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const quotes = await storage.getQuotesWithCategory(page, limit);
      
      // If user is logged in, update isFavorite flag
      if (req.session?.userId) {
        const userId = req.session.userId;
        
        for (const quote of quotes) {
          quote.isFavorite = await storage.isFavorite(userId, quote.id);
        }
      }
      
      res.json(quotes);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/quotes/random", async (req: Request, res: Response) => {
    try {
      let categoryIds = undefined;
      
      if (req.query.categories) {
        categoryIds = (req.query.categories as string).split(',').map(Number);
      }
      
      const quote = await storage.getRandomQuote(categoryIds);
      
      if (!quote) {
        return res.status(404).json({ message: "No quotes found" });
      }
      
      const quoteWithCategory = await storage.getQuoteWithCategory(quote.id);
      
      // Check if user has favorited this quote
      if (req.session?.userId && quoteWithCategory) {
        quoteWithCategory.isFavorite = await storage.isFavorite(req.session.userId, quote.id);
      }
      
      res.json(quoteWithCategory);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuoteWithCategory(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Check if user has favorited this quote
      if (req.session?.userId) {
        quote.isFavorite = await storage.isFavorite(req.session.userId, quote.id);
      }
      
      res.json(quote);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.status(201).json(quote);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const quoteData = insertQuoteSchema.partial().parse(req.body);
      
      const updatedQuote = await storage.updateQuote(id, quoteData);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(updatedQuote);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json({ message: "Quote deleted successfully" });
    } catch (err) {
      handleError(err, res);
    }
  });

  /**
   * Category Routes
   */
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!req.session?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      handleError(err, res);
    }
  });

  /**
   * Favorites Routes
   */
  app.get("/api/favorites", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Login required" });
      }
      
      const favorites = await storage.getFavorites(req.session.userId);
      res.json(favorites);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Login required" });
      }
      
      const userId = req.session.userId;
      const { quoteId } = req.body;
      
      if (!quoteId) {
        return res.status(400).json({ message: "Quote ID is required" });
      }
      
      // Check if quote exists
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Check if already favorited
      const isFavorite = await storage.isFavorite(userId, quoteId);
      if (isFavorite) {
        return res.status(409).json({ message: "Quote already favorited" });
      }
      
      const favorite = await storage.addFavorite({ userId, quoteId });
      res.status(201).json({ message: "Quote added to favorites", favorite });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/favorites/:quoteId", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Login required" });
      }
      
      const userId = req.session.userId;
      const quoteId = parseInt(req.params.quoteId);
      
      const success = await storage.removeFavorite(userId, quoteId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Quote removed from favorites" });
    } catch (err) {
      handleError(err, res);
    }
  });

  /**
   * Settings Routes
   */
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      // If user is logged in, return their settings
      if (req.session?.userId) {
        const settings = await storage.getSettings(req.session.userId);
        
        if (settings) {
          return res.json(settings);
        }
      }
      
      // For non-logged in users or if settings not found, return default settings
      // Check if we have session settings
      if (req.session?.tempSettings) {
        return res.json(req.session.tempSettings);
      }
      
      // Return default settings
      const defaultSettings = {
        theme: "light",
        font: "playfair",
        language: "en",
        textToSpeech: false,
        enableNotifications: true,
        selectedCategories: []
      };
      
      return res.json(defaultSettings);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const settingsData = insertSettingsSchema.partial().parse(req.body);
      
      // If user is logged in, save to database
      if (req.session?.userId) {
        const userId = req.session.userId;
        const settings = await storage.createOrUpdateSettings(userId, {
          ...settingsData,
          userId
        });
        
        return res.json(settings);
      }
      
      // For anonymous users, store in session
      if (!req.session) {
        return res.status(500).json({ message: "Session not available" });
      }
      
      // Create tempSettings if it doesn't exist
      if (!req.session.tempSettings) {
        req.session.tempSettings = {
          theme: "light",
          font: "playfair",
          language: "en",
          textToSpeech: false,
          enableNotifications: true,
          selectedCategories: []
        };
      }
      
      // Create default temp settings if they don't exist
      if (!req.session.tempSettings) {
        req.session.tempSettings = {
          theme: "light",
          font: "Poppins",
          language: "en",
          textToSpeech: false as boolean,  // Explicit type cast
          enableNotifications: false as boolean,  // Explicit type cast
          selectedCategories: [],
        };
      }
      
      // Update temp settings with safe defaults for null values - using type assertion
      const updatedSettings: typeof req.session.tempSettings = {
        ...req.session.tempSettings,
        theme: settingsData.theme ?? req.session.tempSettings.theme ?? "light",
        font: settingsData.font ?? req.session.tempSettings.font ?? "Poppins",
        language: settingsData.language ?? req.session.tempSettings.language ?? "en",
        textToSpeech: settingsData.textToSpeech !== null ? !!settingsData.textToSpeech : (!!req.session.tempSettings.textToSpeech),
        enableNotifications: settingsData.enableNotifications !== null ? !!settingsData.enableNotifications : (!!req.session.tempSettings.enableNotifications),
        selectedCategories: settingsData.selectedCategories ?? req.session.tempSettings.selectedCategories ?? [],
      } as any; // Use type assertion temporarily to bypass TypeScript error
      
      // Add optional AI settings if provided
      if (settingsData.apiKey !== undefined) updatedSettings.apiKey = settingsData.apiKey || undefined;
      if (settingsData.aiModel !== undefined) updatedSettings.aiModel = settingsData.aiModel || undefined;
      if (settingsData.defaultPrompt !== undefined) updatedSettings.defaultPrompt = settingsData.defaultPrompt || undefined;
      
      // Update the session
      req.session.tempSettings = updatedSettings;
      
      return res.json(req.session.tempSettings);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  /**
   * AI Settings Routes
   */
  app.get("/api/settings/ai", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Login required" });
      }
      
      const userId = req.session.userId;
      const settings = await storage.getSettings(userId);
      
      // If no settings found, return defaults
      if (!settings) {
        return res.json({
          apiKey: "",
          aiModel: "gpt-4o",
          defaultPrompt: "Create a motivational quote that inspires action and positive change."
        });
      }
      
      // Return only AI related settings
      res.json({
        apiKey: settings.apiKey || "",
        aiModel: settings.aiModel || "gpt-4o",
        defaultPrompt: settings.defaultPrompt || "Create a motivational quote that inspires action and positive change."
      });
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post("/api/settings/ai", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Login required" });
      }
      
      const userId = req.session.userId;
      const aiSettings = aiSettingsSchema.parse(req.body);
      
      // Save the API key to our global variable for future OpenAI calls
      if (aiSettings.apiKey && aiSettings.apiKey.trim() !== '') {
        customApiKey = aiSettings.apiKey.trim();
        console.log(`User provided a custom OpenAI API key`);
      }
      
      // Update only AI settings
      const settings = await storage.createOrUpdateSettings(userId, {
        userId,
        apiKey: aiSettings.apiKey,
        aiModel: aiSettings.aiModel,
        defaultPrompt: aiSettings.defaultPrompt
      });
      
      // Return only AI related settings
      res.json({
        apiKey: settings.apiKey || "",
        aiModel: settings.aiModel || "gpt-4o",
        defaultPrompt: settings.defaultPrompt || "Create a motivational quote that inspires action and positive change."
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  /**
   * AI Quote Generation
   */
  app.post("/api/quotes/generate", async (req: Request, res: Response) => {
    try {
      const { prompt, category } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Find category id if category name provided
      let categoryId = null;
      if (category && typeof category === 'string') {
        const categories = await storage.getCategories();
        const foundCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
        if (foundCategory) {
          categoryId = foundCategory.id;
        }
      } else if (category && typeof category === 'number') {
        // If category is already a number, use it directly
        categoryId = category;
      }
      
      // Get AI settings or use defaults if user not logged in or settings not found
      let aiModel = "gpt-4o";
      let defaultPrompt = "Create an original, inspiring quote based on the given prompt. Keep it concise (under 150 characters) and profound.";
      
      // If user is logged in, get their settings
      if (req.session?.userId) {
        const settings = await storage.getSettings(req.session.userId);
        if (settings) {
          // Use API key from environment variable if not provided in settings
          aiModel = settings.aiModel || "gpt-4o";
          defaultPrompt = settings.defaultPrompt || defaultPrompt;
        }
      }
      
      // Check if OpenAI is initialized
      if (!openaiInstance) {
        console.log("Falling back to local generation - OpenAI not available");
        // Fallback to a locally generated quote if OpenAI is not available
        const fallbackQuotes = [
          "Every step forward is a step toward achievement.",
          "The key to success is to focus on goals, not obstacles.",
          "Your potential is the sum of all possibilities you have yet to explore.",
          "Believe you can and you're halfway there.",
          "Don't watch the clock; do what it does. Keep going.",
          "The future belongs to those who believe in the beauty of their dreams.",
          "Success is not final, failure is not fatal: it is the courage to continue that counts."
        ];
        
        // Find a quote that contains keyword from prompt if possible
        const keywordMatch = prompt.match(/about\s+(\w+)/i);
        const keyword = keywordMatch ? keywordMatch[1].toLowerCase() : "";
        
        let selectedQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        
        // Try to find a quote that contains the keyword
        const matchingQuotes = fallbackQuotes.filter(quote => 
          quote.toLowerCase().includes(keyword)
        );
        
        if (matchingQuotes.length > 0) {
          selectedQuote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
        }
        
        // Save the generated quote
        const quote = await storage.createQuote({
          text: selectedQuote,
          author: "Inspiration Engine",
          categoryId,
          backgroundUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          isAiGenerated: true
        });
        
        const quoteWithCategory = await storage.getQuoteWithCategory(quote.id);
        return res.json(quoteWithCategory);
      }
      
      try {
        // Use the custom API key if available
        let openaiClient = openaiInstance;
        
        // If the user has provided a custom API key, validate it before using
        if (customApiKey) {
          // Check if it looks like an OpenAI key (starts with "sk-" or similar)
          if (customApiKey.startsWith("sk-")) {
            console.log("Using custom OpenAI API key for quote generation");
            try {
              openaiClient = new OpenAI({
                apiKey: customApiKey
              });
            } catch (error) {
              console.error("Error initializing custom OpenAI client:", error);
              // Fall back to default client or null
            }
          } else {
            console.warn("Provided API key does not appear to be a valid OpenAI key");
            // Invalid key format, don't use it
            customApiKey = null;
          }
        }
        
        if (!openaiClient) {
          throw new Error("OpenAI client is not initialized");
        }
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openaiClient.chat.completions.create({
          model: aiModel,
          messages: [
            {
              role: "system",
              content: "You are a motivational quotes generator. " + defaultPrompt + " Do not include any quotation marks in your response. Just return the quote text and nothing else."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
        
        const quoteText = response.choices[0].message.content?.trim();
        
        // Save the generated quote
        const quote = await storage.createQuote({
          text: quoteText || "Your potential is the sum of all the possibilities you have yet to explore.",
          author: "AI Generated",
          categoryId,
          backgroundUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          isAiGenerated: true
        });
        
        const quoteWithCategory = await storage.getQuoteWithCategory(quote.id);
        
        res.json(quoteWithCategory);
      } catch (error: any) {
        console.error("OpenAI API error:", error);
        
        // Use fallback local quote generation instead of showing an error to the user
        console.log("Falling back to local generation after OpenAI error");
        
        // Select from our local fallback quotes
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
        
        // Save the generated quote
        const quote = await storage.createQuote({
          text: selectedQuote,
          author: "Inspiration Engine",
          categoryId,
          backgroundUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          isAiGenerated: true
        });
        
        const quoteWithCategory = await storage.getQuoteWithCategory(quote.id);
        return res.json(quoteWithCategory);
      }
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
