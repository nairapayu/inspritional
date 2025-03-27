import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import DailyQuoteTab from "./pages/DailyQuoteTab";
import DiscoverTab from "./pages/DiscoverTab";
import FavoritesTab from "./pages/FavoritesTab";
import SettingsTab from "./pages/SettingsTab";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useState, useEffect } from "react";
import { QuoteContextProvider } from "./contexts/QuoteContext";
import { SettingsContextProvider } from "./contexts/SettingsContext";
import ThemeProvider from "./components/ThemeProvider";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [activeTab, setActiveTab] = useState("daily");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Detect URL hash changes for tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["daily", "discover", "favorites", "settings"].includes(hash)) {
        setActiveTab(hash);
      }
      
      if (hash === "admin") {
        setIsAdminPanelOpen(true);
      }
      
      if (hash === "login") {
        setActiveTab("login");
      }
      
      if (hash === "register") {
        setActiveTab("register");
      }
    };

    // Set initial tab from URL hash if present
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    window.location.hash = tabName;
  };

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(!isAdminPanelOpen);
  };

  const closeAdminPanel = () => {
    setIsAdminPanelOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsContextProvider>
        <ThemeProvider>
          <QuoteContextProvider>
            <div className="flex flex-col h-screen bg-gradient-to-b from-[var(--color-background)] to-[var(--color-backgroundEnd)]">
              <Header 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                onToggleAdminPanel={toggleAdminPanel} 
              />
              
              <main className="flex-1 overflow-auto pb-16 sm:pb-0 text-[var(--color-text)]">
                {activeTab === "login" ? (
                  <LoginPage />
                ) : activeTab === "register" ? (
                  <RegisterPage />
                ) : (
                  <>
                    {activeTab === "daily" && <DailyQuoteTab />}
                    {activeTab === "discover" && <DiscoverTab />}
                    {activeTab === "favorites" && <FavoritesTab />}
                    {activeTab === "settings" && <SettingsTab />}
                  </>
                )}
              </main>
              
              <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
              
              {isAdminPanelOpen && <AdminPanel onClose={closeAdminPanel} />}
              
              <Toaster />
            </div>
          </QuoteContextProvider>
        </ThemeProvider>
      </SettingsContextProvider>
    </QueryClientProvider>
  );
}

export default App;
