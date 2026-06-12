import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';

const ThemeContext = createContext();

// =========================================
// 8 ENTERPRISE COLOR THEMES
// =========================================
export const colorThemes = {
  blue: {
    label: 'Cyber Blue',
    swatch: '#3b82f6',
    gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    tertiary: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.15)',
    accentGradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    headerGradient: 'linear-gradient(90deg, rgba(10,22,40,0.92) 0%, rgba(17,34,68,0.88) 50%, rgba(10,22,40,0.92) 100%)',
  },
  purple: {
    label: 'Neon Purple',
    swatch: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    primary: '#8b5cf6',
    secondary: '#c084fc',
    tertiary: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.15)',
    accentGradient: 'linear-gradient(135deg, #7c3aed, #c084fc)',
    headerGradient: 'linear-gradient(90deg, rgba(15,10,40,0.92) 0%, rgba(30,17,68,0.88) 50%, rgba(15,10,40,0.92) 100%)',
  },
  green: {
    label: 'Matrix Green',
    swatch: '#10b981',
    gradient: 'linear-gradient(135deg, #34d399, #10b981)',
    primary: '#10b981',
    secondary: '#34d399',
    tertiary: '#059669',
    glow: 'rgba(16, 185, 129, 0.15)',
    accentGradient: 'linear-gradient(135deg, #059669, #34d399)',
    headerGradient: 'linear-gradient(90deg, rgba(5,22,10,0.92) 0%, rgba(10,40,20,0.88) 50%, rgba(5,22,10,0.92) 100%)',
  },
  red: {
    label: 'Crimson Red',
    swatch: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF5159, #FF0000)',
    primary: '#FF0000',
    secondary: '#FF5159',
    tertiary: '#FF889D',
    glow: 'rgba(255, 0, 0, 0.15)',
    accentGradient: 'linear-gradient(135deg, #FF0000, #FF5159)',
    headerGradient: 'linear-gradient(90deg, rgba(40,10,10,0.92) 0%, rgba(60,15,15,0.88) 50%, rgba(40,10,10,0.92) 100%)',
  },
  white: {
    label: 'Arctic White',
    swatch: '#f8fafc',
    gradient: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    tertiary: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.08)',
    accentGradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    headerGradient: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 50%, rgba(255,255,255,0.95) 100%)',
  },
  midnight: {
    label: 'Midnight Dark',
    swatch: '#0f172a',
    gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    primary: '#6366f1',
    secondary: '#818cf8',
    tertiary: '#4f46e5',
    glow: 'rgba(99, 102, 241, 0.12)',
    accentGradient: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    headerGradient: 'linear-gradient(90deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.92) 50%, rgba(2,6,23,0.95) 100%)',
  },
  cyan: {
    label: 'Ocean Cyan',
    swatch: '#06b6d4',
    gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    primary: '#06b6d4',
    secondary: '#22d3ee',
    tertiary: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.15)',
    accentGradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
    headerGradient: 'linear-gradient(90deg, rgba(5,20,30,0.92) 0%, rgba(10,35,50,0.88) 50%, rgba(5,20,30,0.92) 100%)',
  },
  gray: {
    label: 'Enterprise Gray',
    swatch: '#64748b',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    tertiary: '#4f46e5',
    glow: 'rgba(99, 102, 241, 0.1)',
    accentGradient: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
    headerGradient: 'linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.88) 50%, rgba(15,23,42,0.92) 100%)',
  },
};

// =========================================
// FONT OPTIONS
// =========================================
export const fontOptions = {
  'Merriweather': '"Merriweather", serif',
  'Inter': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Poppins': '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Orbitron': '"Orbitron", "Inter", -apple-system, sans-serif',
  'Roboto': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Montserrat': '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'IBM Plex Sans': '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};


export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem("app-color-theme") || "cyan");
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("app-font") || "Inter");
  const [glassEnabled, setGlassEnabled] = useState(() => localStorage.getItem("app-glass") !== "false");
  const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem("app-anim") !== "false");
  const [particlesEnabled, setParticlesEnabled] = useState(() => localStorage.getItem("app-particles") !== "false");

  // Apply color theme CSS variables
  const applyColorTheme = useCallback((ctKey) => {
    const ct = colorThemes[ctKey] || colorThemes.blue;
    const root = document.documentElement;
    root.style.setProperty('--accent-color', ct.swatch);
    root.style.setProperty('--accent-gradient', ct.gradient);
    root.style.setProperty('--accent-glow', ct.glow);
    root.style.setProperty('--gradient-accent', ct.accentGradient);
  }, []);

  // Apply font
  const applyFont = useCallback((font) => {
    const ff = fontOptions[font] || fontOptions['Inter'];
    document.documentElement.style.setProperty('--font-base', ff);
    document.body.style.fontFamily = ff;
  }, []);

  // Apply theme mode
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // Apply color
  useEffect(() => {
    applyColorTheme(colorTheme);
    localStorage.setItem("app-color-theme", colorTheme);
  }, [colorTheme, applyColorTheme]);

  // Apply font
  useEffect(() => {
    applyFont(fontFamily);
    localStorage.setItem("app-font", fontFamily);
  }, [fontFamily, applyFont]);

  // Apply visual toggles
  useEffect(() => {
    localStorage.setItem("app-glass", glassEnabled);
    if (!glassEnabled) {
      document.body.classList.add('no-glass');
    } else {
      document.body.classList.remove('no-glass');
    }
  }, [glassEnabled]);

  useEffect(() => {
    localStorage.setItem("app-anim", animationsEnabled);
    if (!animationsEnabled) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem("app-particles", particlesEnabled);
    if (!particlesEnabled) {
      document.body.classList.add('no-particles');
    } else {
      document.body.classList.remove('no-particles');
    }
  }, [particlesEnabled]);

  // Persist theme to backend
  const persistThemeToBackend = useCallback(async (themeData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.id) {
        await fetch(`${BACKEND_URL}/api/user-preferences`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            ...themeData,
          }),
        });
      }
    } catch (e) {
      // Silently fail — preferences are always in localStorage
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      persistThemeToBackend({ theme_mode: next });
      return next;
    });
  }, [persistThemeToBackend]);

  const handleSetColorTheme = useCallback((ct) => {
    setColorTheme(ct);
    persistThemeToBackend({ color_theme: ct });
  }, [persistThemeToBackend]);

  const handleSetFont = useCallback((font) => {
    setFontFamily(font);
    persistThemeToBackend({ font_family: font });
  }, [persistThemeToBackend]);

  // Load user preferences from backend on mount
  useEffect(() => {
    const loadRemotePrefs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) return;
        const res = await fetch(`${BACKEND_URL}/api/user-preferences?user_id=${user.id}`);
        const data = await res.json();
        if (data.success && data.preferences) {
          const p = data.preferences;
          if (p.theme_mode && !localStorage.getItem("app-theme-remote-loaded")) {
            setTheme(p.theme_mode);
          }
          if (p.color_theme && !localStorage.getItem("app-color-theme-remote-loaded")) {
            setColorTheme(p.color_theme);
          }
          if (p.font_family && !localStorage.getItem("app-font-remote-loaded")) {
            setFontFamily(p.font_family);
          }
          localStorage.setItem("app-theme-remote-loaded", "true");
          localStorage.setItem("app-color-theme-remote-loaded", "true");
          localStorage.setItem("app-font-remote-loaded", "true");
        }
      } catch (e) {
        // Offline — use localStorage
      }
    };
    loadRemotePrefs();
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme, toggleTheme,
      colorTheme, setColorTheme: handleSetColorTheme, colorThemes,
      fontFamily, setFontFamily: handleSetFont, fontOptions,
      glassEnabled, setGlassEnabled,
      animationsEnabled, setAnimationsEnabled,
      particlesEnabled, setParticlesEnabled
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
