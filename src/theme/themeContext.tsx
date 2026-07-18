import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme, ThemeType } from './theme';
import { localStorage } from '../utils/localStorage';

type ThemeMode = 'light' | 'dark' | 'device';

type ThemeContextType = {
  theme: ThemeType;
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: 'device',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = Appearance.getColorScheme();
  // İlk açılışta cihaz temasına göre başlat
  const [mode, setMode] = useState<ThemeMode>('device');
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(
    systemColorScheme === 'light' ? 'light' : 'dark',
  );

  // Sistem teması değişikliklerini dinle
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemMode(colorScheme === 'light' ? 'light' : 'dark');
    });

    return () => subscription.remove();
  }, []);

  // Aktif tema moduna göre tema seç
  const getActiveTheme = (): 'light' | 'dark' => {
    if (mode === 'device') {
      return systemMode;
    }
    return mode;
  };

  const theme = getActiveTheme() === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const loadThemeMode = async () => {
      const storedMode = localStorage.getString('themeMode');

      if (
        storedMode === 'dark' ||
        storedMode === 'light' ||
        storedMode === 'device'
      ) {
        setMode(storedMode as ThemeMode);
      } else {
        // İlk açılışta cihaz temasına göre ayarla
        setMode('device');
      }
    };
    loadThemeMode();
  }, []);

  const toggleTheme = async () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.set('themeMode', newMode);
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.set('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
