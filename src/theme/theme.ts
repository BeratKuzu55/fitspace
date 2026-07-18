import {
  darkColors,
  darkShadow,
  fonts,
  fontSizes,
  lightColors,
  lightShadow,
  overlays,
  spacing,
} from '../../styles';

export const lightTheme = {
  dark: false,
  colors: lightColors,
  overlays: {
    backdrop: overlays.backdrop.light,
    surfaceOverlay: overlays.surfaceOverlay.light,
    hover: overlays.hover.light,
    pressed: overlays.pressed.light,
    focus: overlays.focus.light,
    disabled: overlays.disabled.light,
    divider: overlays.divider.light,
  },
  fonts,
  fontSizes,
  spacing,
  shadow: lightShadow,
} as const;

export const darkTheme = {
  dark: true,
  colors: darkColors,
  overlays: {
    backdrop: overlays.backdrop.dark,
    surfaceOverlay: overlays.surfaceOverlay.dark,
    hover: overlays.hover.dark,
    pressed: overlays.pressed.dark,
    focus: overlays.focus.dark,
    disabled: overlays.disabled.dark,
    divider: overlays.divider.dark,
  },
  fonts,
  fontSizes,
  spacing,
  shadow: darkShadow,
} as const;

export type ThemeType = typeof lightTheme;
