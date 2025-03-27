import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserMenu from "./UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleAdminPanel: () => void;
}

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

const Header = ({ activeTab, onTabChange, onToggleAdminPanel }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch current user (if logged in)
  const { data: user } = useQuery<User | null>({ 
    queryKey: ['/api/me'],
    staleTime: Infinity,
  });

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="bx bx-bulb text-primary text-2xl"></i>
            <h1 className="text-xl font-serif font-bold">Daily Inspiration</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="text-sm text-primary hover:text-opacity-80" 
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5" />
            </button>
            {user ? (
              <UserMenu 
                user={user} 
                onToggleAdmin={onToggleAdminPanel} 
              />
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full"
                onClick={() => window.location.hash = "login"}
              >
                <User className="h-5 w-5 text-primary" />
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide" aria-label="Tabs">
            <button 
              className={`px-4 py-4 text-sm font-medium border-b-2 ${
                activeTab === "daily" 
                  ? "text-primary border-primary font-bold" 
                  : "text-gray-700 border-transparent hover:text-primary hover:border-primary"
              }`}
              onClick={() => onTabChange("daily")}
            >
              Daily Quote
            </button>
            <button 
              className={`px-4 py-4 text-sm font-medium border-b-2 ${
                activeTab === "discover" 
                  ? "text-primary border-primary font-bold" 
                  : "text-gray-700 border-transparent hover:text-primary hover:border-primary"
              }`}
              onClick={() => onTabChange("discover")}
            >
              Discover
            </button>
            <button 
              className={`px-4 py-4 text-sm font-medium border-b-2 ${
                activeTab === "favorites" 
                  ? "text-primary border-primary font-bold" 
                  : "text-gray-700 border-transparent hover:text-primary hover:border-primary"
              }`}
              onClick={() => onTabChange("favorites")}
            >
              My Favorites
            </button>
            <button 
              className={`px-4 py-4 text-sm font-medium border-b-2 ${
                activeTab === "settings" 
                  ? "text-primary border-primary font-bold" 
                  : "text-gray-700 border-transparent hover:text-primary hover:border-primary"
              }`}
              onClick={() => onTabChange("settings")}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>
      
      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Quotes</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                type="text"
                placeholder="Search by author or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" className="px-3">
              <span className="sr-only">Search</span>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
