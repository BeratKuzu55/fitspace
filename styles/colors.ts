/**
 * Modern UI Color System - 3 Layer Architecture
 * 
 * 1. Primitives: Temadan bağımsız ham renkler (değişmez)
 * 2. Semantic Tokens: Temaya göre değişen semantic renkler
 * 3. Overlays: Yarı şeffaflık katmanları
 */

// ============================================
// 1. PRIMITIVES (Global Palette)
// Temadan bağımsız, değişmeyen ham renkler
// ============================================
export const primitives = {
  // Slate Scale
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Purple Scale
  purple300: '#DDD6FE',
  purple400: '#C4B5FD',
  purple500: '#A78BFA',
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  purple800: '#5B21B6',

  // Lime Scale
  lime400: '#D4E95E',
  lime500: '#D4E95E',
  lime600: '#E2F163',

  // Orange Scale
  orange500: '#F97316',
  orange600: '#FB923C',

  // Gold Scale
  gold500: '#F59E0B',
  gold600: '#FBBF24',

  // Green Scale
  green500: '#22C55E',
  green600: '#4ADE80',

  // Red Scale
  red500: '#EF4444',
  red600: '#F87171',

  // Pink Scale (for navbar icons)
  pink400: '#DE6E8B',
  pink500: '#D68589',

  fitspaceCustom:"#C93210", 

  // Blue Scale (for navbar icons)
  blue500: '#617BAF',

  // Brand Colors
  facebookBlue: '#1877F3',

  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'rgba(255, 255, 255, 0)',
} as const;

// ============================================
// 3. OVERLAYS (Alpha/Transparency Layers)
// Yarı şeffaflık katmanları
// ============================================
export const overlays = {
  // Backdrop Overlays
  backdrop: {
    light: 'rgba(15, 23, 42, 0.4)', // slate900 with 40% opacity
    dark: 'rgba(2, 6, 23, 0.8)', // slate950 with 80% opacity
  },

  // Surface Overlays
  surfaceOverlay: {
    light: 'rgba(15, 23, 42, 0.05)', // Subtle overlay
    dark: 'rgba(255, 255, 255, 0.05)',
  },

  // Hover/Press States
  hover: {
    light: 'rgba(15, 23, 42, 0.08)',
    dark: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    light: 'rgba(15, 23, 42, 0.12)',
    dark: 'rgba(255, 255, 255, 0.12)',
  },

  // Focus States
  focus: {
    light: 'rgba(124, 58, 237, 0.2)', // purple600 with 20% opacity
    dark: 'rgba(167, 139, 250, 0.2)', // purple500 with 20% opacity
  },

  // Disabled States
  disabled: {
    light: 'rgba(15, 23, 42, 0.38)',
    dark: 'rgba(255, 255, 255, 0.38)',
  },

  // Divider Overlays
  divider: {
    light: 'rgba(15, 23, 42, 0.12)',
    dark: 'rgba(255, 255, 255, 0.12)',
  },
} as const;

// ============================================
// 2. SEMANTIC TOKENS (Theme-dependent)
// Temaya göre değişen semantic renkler
// ============================================

/**
 * Light Theme Semantic Colors
 * "Bu renk ne işe yarar?" sorusunun cevabı
 */
export const lightColors = {
  // Surface Colors
  surface: primitives.slate50, // Ana arka plan
  surfaceVariant: primitives.slate100, // Varyant arka plan
  surfaceContainer: primitives.white, // Container arka planı

  // Text Colors
  onSurface: primitives.slate900, // Ana metin (surface üzerinde)
  onSurfaceVariant: primitives.slate600, // İkincil metin
  textPrimary: primitives.slate900,
  textSecondary: primitives.slate500,

  // Background Colors
  background: primitives.slate50,
  backgroundOverlay: primitives.slate100,

  // Primary Colors
  primary: primitives.fitspaceCustom,
  primaryVariant: primitives.purple300,
  onPrimary: primitives.white,

  // Secondary Colors
  secondary: primitives.lime500,
  onSecondary: primitives.slate900,

  // Accent Colors
  accent: primitives.orange500,
  onAccent: primitives.white,

  // State Colors
  success: primitives.green500,
  warning: primitives.gold500,
  error: primitives.red500,
  info: primitives.facebookBlue,

  // Border & Divider
  border: primitives.slate300,
  divider: primitives.slate200,

  // Overlay Colors (for backward compatibility)
  backdrop: overlays.backdrop.light,

  // Gray Scale (Semantic)
  gray100: primitives.slate100,
  gray200: primitives.slate200,
  gray300: primitives.slate300,
  gray400: primitives.slate400,
  gray600: primitives.slate600,
  gray700: primitives.slate600,

  // Brand Colors
  facebookBlue: primitives.facebookBlue,
  googleRed: primitives.red500,
  green: primitives.green500,

  // Legacy Support (deprecated, use semantic names)
  white: primitives.white,
  black: primitives.slate900,
  purple600: primitives.purple600,
  purple300: primitives.purple300,
  lime500: primitives.lime500,
  orange500: primitives.orange500,
  gold500: primitives.gold500,
  transparent: primitives.transparent,
} as const;

/**
 * Dark Theme Semantic Colors
 * "Bu renk ne işe yarar?" sorusunun cevabı
 */
export const darkColors = {
  // Surface Colors
  surface: primitives.slate900, // Ana arka plan
  surfaceVariant: primitives.slate800, // Varyant arka plan
  surfaceContainer: primitives.slate800, // Container arka planı

  // Text Colors
  onSurface: primitives.slate50, // Ana metin (surface üzerinde)
  onSurfaceVariant: primitives.slate400, // İkincil metin
  textPrimary: primitives.slate50,
  textSecondary: primitives.slate400,

  // Background Colors
  background: primitives.slate900,
  backgroundOverlay: primitives.slate800,

  // Primary Colors
  primary: primitives.purple500,
  primaryVariant: primitives.purple400,
  onPrimary: primitives.slate900,

  // Secondary Colors
  secondary: primitives.lime600,
  onSecondary: primitives.slate900,

  // Accent Colors
  accent: primitives.orange600,
  onAccent: primitives.white,

  // State Colors
  success: primitives.green600,
  warning: primitives.gold600,
  error: primitives.red600,
  info: primitives.facebookBlue,

  // Border & Divider
  border: primitives.slate700,
  divider: primitives.slate700,

  // Overlay Colors (for backward compatibility)
  backdrop: overlays.backdrop.dark,

  // Gray Scale (Semantic)
  gray100: primitives.slate800,
  gray200: primitives.slate700,
  gray300: primitives.slate700,
  gray400: primitives.slate500,
  gray600: primitives.slate400,
  gray700: primitives.slate400,

  // Brand Colors
  facebookBlue: primitives.facebookBlue,
  googleRed: primitives.red600,
  green: primitives.green600,

  // Legacy Support (deprecated, use semantic names)
  white: primitives.white,
  black: primitives.slate950,
  purple600: primitives.purple500,
  purple300: primitives.purple400,
  lime500: primitives.lime600,
  orange500: primitives.orange600,
  gold500: primitives.gold600,
  transparent: primitives.transparent,
} as const;

// Type exports for TypeScript
export type Primitives = typeof primitives;
export type LightColors = typeof lightColors;
export type DarkColors = typeof darkColors;
export type Overlays = typeof overlays;
