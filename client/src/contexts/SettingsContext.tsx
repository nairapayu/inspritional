import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SettingsType {
  theme: string;
  font: string;
  language: string;
  textToSpeech: boolean;
  enableNotifications: boolean;
  selectedCategories: string[];
}

interface SettingsContextType {
  settings: SettingsType | null;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
  saveSettings: () => void;
  isSaving: boolean;
}

const defaultSettings: SettingsType = {
  theme: "light",
  font: "playfair",
  language: "en",
  textToSpeech: false,
  enableNotifications: true,
  selectedCategories: ["Motivation", "Inspiration", "Mindfulness"]
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsContextProvider");
  }
  return context;
};

interface SettingsContextProviderProps {
  children: ReactNode;
}

export const SettingsContextProvider = ({ children }: SettingsContextProviderProps) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const { toast } = useToast();
  
  // Fetch user settings
  const { data, isLoading } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
    onError: () => {
      setSettings(defaultSettings);
    }
  });
  
  // Update settings when data is fetched
  useEffect(() => {
    if (data) {
      setSettings(data);
    } else if (!isLoading) {
      setSettings(defaultSettings);
    }
  }, [data, isLoading]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<SettingsType>) => {
      return apiRequest('POST', '/api/settings', newSettings);
    },
    onSuccess: (data) => {
      setSettings(data as SettingsType);
      toast({
        title: "Settings saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update settings locally
  const updateSettings = (newSettings: Partial<SettingsType>) => {
    if (settings) {
      setSettings({ ...settings, ...newSettings });
    }
  };
  
  // Save settings to server
  const saveSettings = () => {
    if (settings) {
      saveSettingsMutation.mutate(settings);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        saveSettings,
        isSaving: saveSettingsMutation.isPending
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
