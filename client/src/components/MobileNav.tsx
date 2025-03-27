import { 
  Lightbulb, 
  Compass, 
  Heart, 
  Settings 
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  return (
    <nav className="sm:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="grid grid-cols-4">
        <button 
          className={`flex flex-col items-center justify-center py-4 px-2 touch-manipulation ${
            activeTab === "daily" ? "text-primary font-medium" : "text-gray-700"
          }`}
          onClick={() => onTabChange("daily")}
        >
          <Lightbulb className="h-5 w-5" />
          <span className="text-xs mt-1">Daily</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center py-4 px-2 touch-manipulation ${
            activeTab === "discover" ? "text-primary font-medium" : "text-gray-700"
          }`}
          onClick={() => onTabChange("discover")}
        >
          <Compass className="h-5 w-5" />
          <span className="text-xs mt-1">Discover</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center py-4 px-2 touch-manipulation ${
            activeTab === "favorites" ? "text-primary font-medium" : "text-gray-700"
          }`}
          onClick={() => onTabChange("favorites")}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center py-4 px-2 touch-manipulation ${
            activeTab === "settings" ? "text-primary font-medium" : "text-gray-700"
          }`}
          onClick={() => onTabChange("settings")}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;