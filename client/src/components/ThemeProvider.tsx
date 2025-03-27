import { ReactNode, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

// Theme constants
const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    backgroundEnd: '#F5F7FA',
    text: '#2C3E50',
    primary: '#6B8EAE',
    secondary: '#95A5A6',
    accent: '#FFB84D',
  },
  dark: {
    background: '#1E293B',
    backgroundEnd: '#0F172A',
    text: '#F8FAFC',
    primary: '#6B8EAE',
    secondary: '#94A3B8',
    accent: '#FFB84D',
  },
  ocean: {
    background: '#E0F7FA',
    backgroundEnd: '#B2EBF2',
    text: '#1A237E',
    primary: '#0097A7',
    secondary: '#4FC3F7',
    accent: '#FFB84D',
  },
  sunset: {
    background: '#FFF8E1',
    backgroundEnd: '#FFECB3',
    text: '#3E2723',
    primary: '#FF9800',
    secondary: '#FFCC80',
    accent: '#795548',
  }
};

// Language translation map
export const TRANSLATIONS = {
  en: {
    daily: 'Daily Quote',
    discover: 'Discover',
    favorites: 'Favorites',
    settings: 'Settings',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    admin: 'Admin Panel',
    saveSettings: 'Save Settings',
    language: 'Language',
    theme: 'Theme',
    font: 'Font',
    notifications: 'Notifications',
    textToSpeech: 'Text to Speech',
    categories: 'Categories',
    share: 'Share',
    copy: 'Copy',
    favorite: 'Favorite',
    speak: 'Speak',
    generate: 'Generate',
  },
  es: {
    daily: 'Cita Diaria',
    discover: 'Descubrir',
    favorites: 'Favoritos',
    settings: 'Ajustes',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    admin: 'Panel de Admin',
    saveSettings: 'Guardar Ajustes',
    language: 'Idioma',
    theme: 'Tema',
    font: 'Fuente',
    notifications: 'Notificaciones',
    textToSpeech: 'Texto a Voz',
    categories: 'Categorías',
    share: 'Compartir',
    copy: 'Copiar',
    favorite: 'Favorito',
    speak: 'Hablar',
    generate: 'Generar',
  },
  fr: {
    daily: 'Citation du Jour',
    discover: 'Découvrir',
    favorites: 'Favoris',
    settings: 'Paramètres',
    login: 'Connexion',
    register: 'S\'inscrire',
    logout: 'Déconnexion',
    admin: 'Panneau d\'Admin',
    saveSettings: 'Enregistrer',
    language: 'Langue',
    theme: 'Thème',
    font: 'Police',
    notifications: 'Notifications',
    textToSpeech: 'Synthèse Vocale',
    categories: 'Catégories',
    share: 'Partager',
    copy: 'Copier',
    favorite: 'Favori',
    speak: 'Parler',
    generate: 'Générer',
  },
  de: {
    daily: 'Tägliches Zitat',
    discover: 'Entdecken',
    favorites: 'Favoriten',
    settings: 'Einstellungen',
    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    admin: 'Admin-Panel',
    saveSettings: 'Einstellungen speichern',
    language: 'Sprache',
    theme: 'Thema',
    font: 'Schriftart',
    notifications: 'Benachrichtigungen',
    textToSpeech: 'Text zu Sprache',
    categories: 'Kategorien',
    share: 'Teilen',
    copy: 'Kopieren',
    favorite: 'Favorit',
    speak: 'Sprechen',
    generate: 'Generieren',
  },
  zh: {
    daily: '每日引言',
    discover: '发现',
    favorites: '收藏',
    settings: '设置',
    login: '登录',
    register: '注册',
    logout: '登出',
    admin: '管理面板',
    saveSettings: '保存设置',
    language: '语言',
    theme: '主题',
    font: '字体',
    notifications: '通知',
    textToSpeech: '文字转语音',
    categories: '分类',
    share: '分享',
    copy: '复制',
    favorite: '收藏',
    speak: '朗读',
    generate: '生成',
  },
  hi: {
    daily: 'दैनिक उद्धरण',
    discover: 'खोजें',
    favorites: 'पसंदीदा',
    settings: 'सेटिंग्स',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    admin: 'एडमिन पैनल',
    saveSettings: 'सेटिंग्स सहेजें',
    language: 'भाषा',
    theme: 'थीम',
    font: 'फ़ॉन्ट',
    notifications: 'सूचनाएं',
    textToSpeech: 'टेक्स्ट टू स्पीच',
    categories: 'श्रेणियां',
    share: 'शेयर',
    copy: 'कॉपी',
    favorite: 'पसंदीदा',
    speak: 'बोलें',
    generate: 'उत्पन्न',
  },
  ur: {
    daily: 'روزانہ اقتباس',
    discover: 'دریافت کریں',
    favorites: 'پسندیدہ',
    settings: 'ترتیبات',
    login: 'لاگ ان',
    register: 'رجسٹر',
    logout: 'لاگ آؤٹ',
    admin: 'ایڈمن پینل',
    saveSettings: 'ترتیبات محفوظ کریں',
    language: 'زبان',
    theme: 'تھیم',
    font: 'فونٹ',
    notifications: 'اطلاعات',
    textToSpeech: 'ٹیکسٹ ٹو سپیچ',
    categories: 'زمرے',
    share: 'شیئر',
    copy: 'کاپی',
    favorite: 'پسندیدہ',
    speak: 'بولیں',
    generate: 'بنائیں',
  }
};

// Current language for translations
let currentLanguage = 'en';

// Expose translation function
export function t(key: string): string {
  return TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS]?.[key as keyof (typeof TRANSLATIONS)['en']] || key;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // Apply theme colors to CSS variables
    const theme = settings.theme || 'light';
    const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.light;
    
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply font
    const fontClass = settings.font === 'playfair' 
      ? 'font-serif' 
      : settings.font === 'merriweather' 
        ? 'font-serif' 
        : 'font-sans';
    
    document.body.className = fontClass;
    
    // Set current language for translations
    currentLanguage = settings.language || 'en';
    
  }, [settings]);

  return <>{children}</>;
};

export default ThemeProvider;