import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  quotes, type Quote, type InsertQuote,
  favorites, type Favorite, type InsertFavorite,
  settings, type Settings, type InsertSettings,
  type QuoteWithCategory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Quote operations
  getQuotes(page?: number, limit?: number): Promise<Quote[]>;
  getQuotesByCategory(categoryId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  getRandomQuote(categoryIds?: number[]): Promise<Quote | undefined>;
  getQuoteWithCategory(id: number): Promise<QuoteWithCategory | undefined>;
  getQuotesWithCategory(page?: number, limit?: number): Promise<QuoteWithCategory[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Favorite operations
  getFavorites(userId: number): Promise<QuoteWithCategory[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, quoteId: number): Promise<boolean>;
  isFavorite(userId: number, quoteId: number): Promise<boolean>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private quotes: Map<number, Quote>;
  private favorites: Map<number, Favorite[]>;
  private settings: Map<number, Settings>;
  private currentIds: {
    users: number;
    categories: number;
    quotes: number;
    favorites: number;
    settings: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.quotes = new Map();
    this.favorites = new Map();
    this.settings = new Map();
    
    this.currentIds = {
      users: 1,
      categories: 1,
      quotes: 1,
      favorites: 1,
      settings: 1
    };
    
    // Initialize with some seed data
    this.initSeedData();
  }

  private initSeedData() {
    // Add default categories
    const categoryNames = ["Motivation", "Leadership", "Success", "Happiness", "Mindfulness", "Inspiration", "Perseverance", "Wisdom"];
    categoryNames.forEach(name => {
      this.createCategory({ name });
    });

    // Add some initial quotes
    const initialQuotes = [
      {
        text: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt",
        categoryId: 1, // Motivation
        backgroundUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "The best way to predict the future is to create it.",
        author: "Abraham Lincoln",
        categoryId: 3, // Success
        backgroundUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu",
        categoryId: 6, // Inspiration
        backgroundUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "We become what we think about most of the time.",
        author: "Earl Nightingale",
        categoryId: 5, // Mindfulness
        backgroundUrl: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela",
        categoryId: 7, // Perseverance
        backgroundUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
        categoryId: 4, // Happiness
        backgroundUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.",
        author: "Mark Twain",
        categoryId: 8, // Wisdom
        backgroundUrl: "https://images.unsplash.com/photo-1476611317561-60117649dd94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        text: "Your potential is the sum of all the possibilities you have yet to explore.",
        author: "AI Generated",
        categoryId: 1, // Motivation
        backgroundUrl: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isAiGenerated: true,
      }
    ];

    initialQuotes.forEach(quote => {
      this.createQuote(quote);
    });

    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Quote operations
  async getQuotes(page: number = 1, limit: number = 10): Promise<Quote[]> {
    const quotes = Array.from(this.quotes.values());
    const start = (page - 1) * limit;
    const end = start + limit;
    return quotes.slice(start, end);
  }

  async getQuotesByCategory(categoryId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.categoryId === categoryId
    );
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getRandomQuote(categoryIds?: number[]): Promise<Quote | undefined> {
    let filteredQuotes = Array.from(this.quotes.values());
    
    if (categoryIds && categoryIds.length > 0) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.categoryId && categoryIds.includes(quote.categoryId)
      );
    }
    
    if (filteredQuotes.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentIds.quotes++;
    const quote: Quote = { ...insertQuote, id };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { ...quote, ...quoteData };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }

  async getQuoteWithCategory(id: number): Promise<QuoteWithCategory | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const category = quote.categoryId ? this.categories.get(quote.categoryId) : null;
    
    return {
      ...quote,
      categoryName: category ? category.name : null,
      isFavorite: false // Will be updated when user context is available
    };
  }

  async getQuotesWithCategory(page: number = 1, limit: number = 10): Promise<QuoteWithCategory[]> {
    const quotes = await this.getQuotes(page, limit);
    
    return quotes.map(quote => {
      const category = quote.categoryId ? this.categories.get(quote.categoryId) : null;
      
      return {
        ...quote,
        categoryName: category ? category.name : null,
        isFavorite: false // Will be updated when user context is available
      };
    });
  }

  // Favorite operations
  async getFavorites(userId: number): Promise<QuoteWithCategory[]> {
    const userFavorites = this.favorites.get(userId) || [];
    
    return userFavorites.map(favorite => {
      const quote = this.quotes.get(favorite.quoteId);
      if (!quote) {
        return null;
      }
      
      const category = quote.categoryId ? this.categories.get(quote.categoryId) : null;
      
      return {
        ...quote,
        categoryName: category ? category.name : null,
        isFavorite: true
      };
    }).filter(Boolean) as QuoteWithCategory[];
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentIds.favorites++;
    const favorite: Favorite = { ...insertFavorite, id, createdAt: new Date() };
    
    const userFavorites = this.favorites.get(insertFavorite.userId) || [];
    userFavorites.push(favorite);
    
    this.favorites.set(insertFavorite.userId, userFavorites);
    return favorite;
  }

  async removeFavorite(userId: number, quoteId: number): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    const initialLength = userFavorites.length;
    
    const updatedFavorites = userFavorites.filter(
      (favorite) => favorite.quoteId !== quoteId
    );
    
    this.favorites.set(userId, updatedFavorites);
    return updatedFavorites.length < initialLength;
  }

  async isFavorite(userId: number, quoteId: number): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.some((favorite) => favorite.quoteId === quoteId);
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }

  async createOrUpdateSettings(userId: number, settingsData: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = this.settings.get(userId);
    
    if (existingSettings) {
      const updatedSettings = { ...existingSettings, ...settingsData };
      this.settings.set(userId, updatedSettings);
      return updatedSettings;
    } else {
      const id = this.currentIds.settings++;
      const defaultSettings: Settings = {
        id,
        userId,
        theme: "light",
        font: "playfair",
        language: "en",
        textToSpeech: false,
        enableNotifications: true,
        selectedCategories: [],
        apiKey: null,
        aiModel: "gpt-4o",
        defaultPrompt: "Create a motivational quote that inspires action and positive change."
      };
      
      const newSettings = { ...defaultSettings, ...settingsData };
      this.settings.set(userId, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
