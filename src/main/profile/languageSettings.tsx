import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RoundedButton from '../../../components/RoundedButton';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  detectDeviceLanguage,
  normalizeLanguageCode,
} from '../../locales/i18n';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

type LanguageOption = {
  code: SupportedLanguage;
};

const AVAILABLE_LANGUAGES: LanguageOption[] = SUPPORTED_LANGUAGES.map(code => ({
  code,
}));

type LanguageSettingsProps = Record<string, never>;

const LanguageSettings: React.FC<LanguageSettingsProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t, i18n } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [systemLanguage] = useState<SupportedLanguage>(() =>
    detectDeviceLanguage(),
  );
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>(() =>
    normalizeLanguageCode(i18n.language),
  );
  const [pendingLanguage, setPendingLanguage] =
    useState<SupportedLanguage>(activeLanguage);

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      const normalized = normalizeLanguageCode(language);
      setActiveLanguage(normalized);
      setPendingLanguage(normalized);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const languages = useMemo(() => {
    return AVAILABLE_LANGUAGES.map(option => {
      const name = t(`languageSettings.languageList.${option.code}.name`);
      const nativeName = t(
        `languageSettings.languageList.${option.code}.nativeName`,
      );
      const region = t(`languageSettings.languageList.${option.code}.region`);

      return {
        ...option,
        name,
        nativeName,
        region,
      };
    }).sort((a, b) => {
      // Add type assertions to satisfy TypeScript
      return (a.name as string).localeCompare(b.name as string);
    });
  }, [t]);

  const filteredLanguages = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (!trimmedQuery.length) {
      return languages;
    }

    const toSearchable = (value: unknown) =>
      typeof value === 'string' ? value.toLowerCase() : '';

    return languages.filter(language => {
      const name = toSearchable(language.name);
      const nativeName = toSearchable(language.nativeName);
      const region = toSearchable(language.region);

      return (
        name.includes(trimmedQuery) ||
        nativeName.includes(trimmedQuery) ||
        region.includes(trimmedQuery) ||
        language.code.toLowerCase().includes(trimmedQuery)
      );
    });
  }, [languages, searchQuery]);

  const handleApply = async () => {
    if (pendingLanguage === activeLanguage || isApplying) {
      return;
    }

    setIsApplying(true);

    try {
      // Convert language code to uppercase (tr -> TR, en -> EN)
      const languageCode = pendingLanguage.toUpperCase();

      // Update language in backend
      const response = await api.post(
        '/api/user',
        { language: languageCode },
        {
          requiresAuth: true,
          validateStatus: s => s < 500,
        },
      );

      if (response.status === 401) {
        showNotification(
          t('languageSettings.toastError'),
          t('languageSettings.authFailed') || 'Authentication failed',
          'danger',
        );
        setIsApplying(false);
        return;
      }

      if (response.status >= 200 && response.status < 300) {
        // Update language in i18n only after successful API call
        await i18n.changeLanguage(pendingLanguage);
        showNotification(
          t('languageSettings.toastSuccess'),
          undefined,
          'success',
        );
      } else {
        showNotification(
          t('languageSettings.toastError'),
          t('languageSettings.updateFailed') || 'Update failed',
          'danger',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(t('languageSettings.toastError'), undefined, 'danger');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, styles.languageTitle]}>
          {t('languageSettings.title')}
        </Text>
        <Text style={[styles.subtitle, styles.languageSubtitle]}>
          {t('languageSettings.subtitle')}
        </Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('languageSettings.searchPlaceholder')}
          placeholderTextColor={
            theme.dark ? theme.colors.textSecondary : theme.colors.border
          }
          style={styles.searchBox}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.languageCard}>
          {filteredLanguages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {t('languageSettings.emptyResult')}
              </Text>
            </View>
          ) : (
            filteredLanguages.map(language => {
              const isActive = language.code === activeLanguage;
              const isPending = language.code === pendingLanguage;
              const isSystem = language.code === systemLanguage;

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  key={language.code}
                  onPress={() => setPendingLanguage(language.code)}
                >
                  <View
                    style={[
                      styles.languageRow,
                      isPending && styles.languageRowSelected,
                    ]}
                  >
                    <View style={styles.languageAvatar}>
                      <Text style={styles.languageAvatarText}>
                        {language.code.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageNative}>
                        {language.nativeName}
                      </Text>
                      <Text style={styles.languageRegion}>
                        {language.region}
                      </Text>
                    </View>

                    <View style={styles.languageMeta}>
                      {isSystem && !isActive && (
                        <View style={[styles.badge, styles.badgeMuted]}>
                          <Text
                            style={[styles.badgeText, styles.badgeMutedText]}
                          >
                            {t('languageSettings.systemBadge')}
                          </Text>
                        </View>
                      )}

                      {isActive && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {t('languageSettings.activeBadge')}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.radio,
                          isPending && styles.radioSelected,
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <RoundedButton
          text={
            isApplying
              ? t('languageSettings.applyingLabel')
              : t('languageSettings.applyButton')
          }
          onPress={handleApply}
          disabled={pendingLanguage === activeLanguage || isApplying}
        />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default LanguageSettings;
