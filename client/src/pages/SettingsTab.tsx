import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";
import { t } from "@/components/ThemeProvider";

const SettingsTab = () => {
  const { settings, updateSettings, saveSettings, isLoading, isSaving } = useSettings();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Update selected categories when settings change
  useEffect(() => {
    if (settings?.selectedCategories) {
      setSelectedCategories(settings.selectedCategories);
    }
  }, [settings]);
  
  // Toggle category selection
  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      const newCategories = selectedCategories.filter(c => c !== categoryName);
      setSelectedCategories(newCategories);
      updateSettings({ selectedCategories: newCategories });
    } else {
      const newCategories = [...selectedCategories, categoryName];
      setSelectedCategories(newCategories);
      updateSettings({ selectedCategories: newCategories });
    }
  };
  
  // Handle settings changes
  const handleThemeChange = (theme: string) => {
    updateSettings({ theme });
  };
  
  const handleFontChange = (font: string) => {
    updateSettings({ font });
  };
  
  const handleLanguageChange = (language: string) => {
    updateSettings({ language });
  };
  
  const handleTextToSpeechToggle = (enabled: boolean) => {
    updateSettings({ textToSpeech: enabled });
  };
  
  const handleNotificationsToggle = (enabled: boolean) => {
    updateSettings({ enableNotifications: enabled });
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    saveSettings();
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-medium text-textColor mb-6">App Settings</h2>
        <Skeleton className="h-[600px] w-full rounded-custom" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-textColor">{t('settings')}</h2>

        <Card className="rounded-custom shadow-md overflow-hidden">
          {/* Appearance Settings */}
          <div className="border-b border-gray-100">
            <CardContent className="p-5">
              <h3 className="font-medium mb-4">{t('appearance')}</h3>
              
              {/* Theme Selection */}
              <div className="space-y-5">
                <div>
                  <Label className="block text-sm font-medium mb-2">{t('theme')}</Label>
                  <div className="grid grid-cols-4 gap-3">
                    <button 
                      className={`h-12 rounded-custom ${
                        settings?.theme === "light" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      } bg-white`} 
                      onClick={() => handleThemeChange("light")}
                    />
                    <button 
                      className={`h-12 rounded-custom ${
                        settings?.theme === "dark" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      } bg-gray-800`}
                      onClick={() => handleThemeChange("dark")}
                    />
                    <button 
                      className={`h-12 rounded-custom ${
                        settings?.theme === "ocean" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      }`}
                      style={{ background: "linear-gradient(135deg, #6B8EAE, #95A5A6)" }}
                      onClick={() => handleThemeChange("ocean")}
                    />
                    <button 
                      className={`h-12 rounded-custom ${
                        settings?.theme === "sunset" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      }`}
                      style={{ background: "linear-gradient(135deg, #FFB84D, #FFA726)" }}
                      onClick={() => handleThemeChange("sunset")}
                    />
                  </div>
                </div>
                
                {/* Font Settings */}
                <div>
                  <Label className="block text-sm font-medium mb-2">{t('font')}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      className={`py-2 px-3 rounded-custom ${
                        settings?.font === "playfair" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      } font-serif`}
                      onClick={() => handleFontChange("playfair")}
                    >
                      Playfair
                    </button>
                    <button 
                      className={`py-2 px-3 rounded-custom ${
                        settings?.font === "poppins" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      } font-sans`}
                      onClick={() => handleFontChange("poppins")}
                    >
                      Poppins
                    </button>
                    <button 
                      className={`py-2 px-3 rounded-custom ${
                        settings?.font === "merriweather" 
                          ? "border-2 border-primary" 
                          : "border border-gray-200"
                      }`}
                      style={{ fontFamily: "serif" }}
                      onClick={() => handleFontChange("merriweather")}
                    >
                      Merriweather
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Preferences */}
          <div className="border-b border-gray-100">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-medium mb-2">Preferences</h3>
              
              {/* Toggle Switches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Daily Notifications</Label>
                    <p className="text-sm text-secondary">Get daily quote notifications</p>
                  </div>
                  <Switch 
                    checked={settings?.enableNotifications || false}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Text-to-Speech</Label>
                    <p className="text-sm text-secondary">Enable quote reading</p>
                  </div>
                  <Switch 
                    checked={settings?.textToSpeech || false}
                    onCheckedChange={handleTextToSpeechToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Remove Ads</Label>
                    <p className="text-sm text-secondary">Remove all advertisements</p>
                  </div>
                  <Button className="bg-accent hover:bg-opacity-90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Language Settings */}
          <div>
            <CardContent className="p-5">
              <h3 className="font-medium mb-4">Language & Region</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">{t('language')}</Label>
                  <Select 
                    value={settings?.language || "en"} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">Quote Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                        className={`px-3 py-1 cursor-pointer ${
                          selectedCategories.includes(category.name) 
                            ? "bg-primary text-white" 
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleCategory(category.name)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-primary text-white px-6 py-2 rounded-custom shadow-sm font-medium hover:bg-opacity-90 transition-colors"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : t('saveSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
