import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AppColors from '../src/utils/theme/colors';
import { localStorage } from './src/utils/localStorage';

const ThemeContext = createContext();

const defaultTheme = {
  colors: AppColors.black,
  background: AppColors.white,
  text: AppColors.black,
  inputBackground: AppColors.black,
  placeholderText: AppColors.gray300,
};

const darkTheme = {
  colors: AppColors.white,
  background: AppColors.black,
  text: AppColors.white,
  inputBackground: AppColors.white,
  placeholderText: AppColors.gray700,
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(
    systemColorScheme === 'dark' ? darkTheme : defaultTheme,
  );

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = localStorage.getString('theme');

      if (storedTheme) {
        setTheme(JSON.parse(storedTheme));
      } else {
        setTheme(systemColorScheme === 'dark' ? darkTheme : defaultTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === defaultTheme ? darkTheme : defaultTheme;
    setTheme(newTheme);
    localStorage.set('theme', JSON.stringify(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
