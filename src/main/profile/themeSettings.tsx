import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import useStyles from './styles';

type ThemeMode = 'light' | 'dark' | 'device';

type ThemeSettingsProps = Record<string, never>;

const ThemeSettings: React.FC<ThemeSettingsProps> = () => {
  const { theme, mode, setThemeMode } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);

  useEffect(() => {
    setSelectedMode(mode);
  }, [mode]);

  const handleThemeChange = (newMode: ThemeMode) => {
    setSelectedMode(newMode);
    setThemeMode(newMode);
  };

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'device', label: t('themeSettings.labels.device') },
    { value: 'dark', label: t('themeSettings.labels.dark') },
    { value: 'light', label: t('themeSettings.labels.light') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('themeSettings.title')}</Text>
      <View style={styles.themeOptionsContainer}>
        {themeOptions.map(option => {
          const isSelected = selectedMode === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOptionRow,
                isSelected && styles.themeOptionRowSelected,
              ]}
              onPress={() => handleThemeChange(option.value)}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  isSelected && styles.themeOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              <View
                style={[
                  styles.themeRadio,
                  isSelected && styles.themeRadioSelected,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ThemeSettings;
