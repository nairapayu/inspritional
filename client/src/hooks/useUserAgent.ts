import { useState, useEffect } from 'react';

interface UserAgentInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isStandalone: boolean;
}

export function useUserAgent(): UserAgentInfo {
  const [userAgentInfo, setUserAgentInfo] = useState<UserAgentInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isStandalone: false
  });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const ua = navigator.userAgent;
    
    // Test for mobile devices
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    // Test for tablets (imperfect but serves as a basic check)
    const isTabletDevice = 
      /(iPad|Android(?!.*Mobile)|Tablet|Silk)/.test(ua) || 
      (window.innerWidth >= 600 && window.innerWidth < 1200);
    
    // Test for specific platforms
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    
    // Test for browsers
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    const isChrome = /Chrome/i.test(ua);
    
    // Test for standalone mode (PWA installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setUserAgentInfo({
      isMobile: isMobileDevice && !isTabletDevice,
      isTablet: isTabletDevice,
      isDesktop: !isMobileDevice && !isTabletDevice,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isStandalone
    });
  }, []);

  return userAgentInfo;
}

export default useUserAgent;