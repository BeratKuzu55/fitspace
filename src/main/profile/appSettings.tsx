import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faKey,
  faLanguage,
  faPalette,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProfileButton from '../../../components/ProfileButton';
import { useTheme } from '../../theme';
import { ProfileStackParamList } from '../../types/navigation';
import useStyles from './styles';

type AppSettingsProps = Record<string, never>;

const AppSettings: React.FC<AppSettingsProps> = () => {
  const { t } = useTranslation();

  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{t('appSettings.title')}</Text>

        <ProfileButton
          title={t('appSettings.buttons.notificationSettings')}
          icon={faBell as IconProp}
          onPress={() => navigation.navigate('NotificationSettings')}
        />

        <ProfileButton
          title={t('appSettings.buttons.themeSettings')}
          icon={faPalette as IconProp}
          onPress={() => navigation.navigate('ThemeSettings')}
        />

        <ProfileButton
          title={t('appSettings.buttons.languageSettings')}
          icon={faLanguage as IconProp}
          onPress={() => navigation.navigate('LanguageSettings')}
        />

        <ProfileButton
          title={t('appSettings.buttons.changePassword')}
          icon={faKey as IconProp}
          onPress={() => navigation.navigate('ResetPassword', {})}
        />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default AppSettings;
