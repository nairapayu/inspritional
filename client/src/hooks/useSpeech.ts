import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

interface UseSpeechReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

export const useSpeech = (): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);
    
    // Clean up any ongoing speech when component unmounts
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);
  
  // Handle speech end event
  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };
    
    if (isSupported) {
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      
      return () => {
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
      };
    }
  }, [isSupported]);

  // Speak text
  const speak = (text: string) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on user settings
    if (settings?.language) {
      utterance.lang = settings.language;
    }
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };
  
  // Cancel speech
  const cancel = () => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    speak,
    cancel,
    isSpeaking,
    isPaused,
    isSupported
  };
};
