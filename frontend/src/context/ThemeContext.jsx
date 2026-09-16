import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const ACCENT_PRESETS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Orange", value: "#f97316" },
];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("klyro-theme");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.mode === "light" || parsed.mode === "dark") return parsed.mode;
    }
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

function getInitialAccent() {
  try {
    const saved = localStorage.getItem("klyro-theme");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.accent) return parsed.accent;
    }
  } catch {}
  return "#6366f1";
}

function persistTheme(mode, accent) {
  localStorage.setItem("klyro-theme", JSON.stringify({ mode, accent }));
}

function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function generateAccentShades(hex) {
  const { h, s, l } = hexToHSL(hex);
  return {
    base: `hsl(${h}, ${s}%, ${l}%)`,
    hover: `hsl(${h}, ${s}%, ${Math.max(l - 8, 0)}%)`,
    light: `hsl(${h}, ${s}%, ${l}%) / 0.1`,
    lightSolid: `hsl(${h}, ${Math.min(s + 5, 100)}%, ${Math.min(l + 30, 95)}%)`,
    muted: `hsl(${h}, ${Math.min(s + 5, 100)}%, ${Math.min(l + 35, 97)}%)`,
  };
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialTheme);
  const [accent, setAccent] = useState(getInitialAccent);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);

    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    const shades = generateAccentShades(accent);
    root.style.setProperty("--accent", shades.base);
    root.style.setProperty("--accent-hover", shades.hover);
    root.style.setProperty("--accent-light", shades.light);
    root.style.setProperty("--accent-light-solid", shades.lightSolid);
    root.style.setProperty("--accent-muted", shades.muted);
    root.style.setProperty("--accent-raw", accent);

    persistTheme(mode, accent);
  }, [mode, accent]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const saved = localStorage.getItem("klyro-theme");
      if (!saved) setMode(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const setLight = () => setMode("light");
  const setDark = () => setMode("dark");

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        setMode,
        setAccent,
        toggleMode,
        setLight,
        setDark,
        accentPresets: ACCENT_PRESETS,
        isDark: mode === "dark",
        isLight: mode === "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
