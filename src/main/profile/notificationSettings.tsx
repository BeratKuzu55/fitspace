import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Switch,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import RoundedButton from '../../../components/RoundedButton';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

// State yapısını tek bir objede topluyoruz
interface NotificationState {
  general_notifications: boolean;
  sound: boolean;
  vibration: boolean;
  reminder_notifications: boolean;
}

type NotificationSettingsProps = Record<string, never>;

const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  // Tekil state ve loading kontrolü
  const [settings, setSettings] = useState<NotificationState>({
    general_notifications: false,
    sound: false,
    vibration: false,
    reminder_notifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Veri Çekme
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/user_notification_settings', {
        requiresAuth: true,
      });

      if (res.data) {
        setSettings({
          general_notifications: !!res.data.general_notifications,
          sound: !!res.data.sound,
          vibration: !!res.data.vibration,
          reminder_notifications: !!res.data.reminder_notifications,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('common.error'),
        t('notificationSettings.notifications.infoFetchFailed'),
        'danger',
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      const res = await api.post('/api/user_notification_settings', settings, {
        requiresAuth: true,
      });

      if (res.status >= 200 && res.status < 300) {
        showNotification(
          t('common.success'),
          t('notificationSettings.notifications.updateSuccessMessage'),
          'success',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('common.error'),
        t('notificationSettings.notifications.updateFailed'),
        'danger',
      );
    } finally {
      setSubmitting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings]),
  );

  const renderSettingRow = (
    labelKey: string,
    value: boolean,
    key: keyof NotificationState,
  ) => (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>
        {t(`notificationSettings.settings.${labelKey}`)}
      </Text>
      <Switch
        value={value}
        onValueChange={newValue =>
          setSettings(prev => ({ ...prev, [key]: newValue }))
        }
        thumbColor={value ? theme.colors.primary : theme.colors.border}
        trackColor={{
          false: theme.colors.textSecondary,
          true: theme.colors.primary,
        }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('notificationSettings.title')}</Text>

      {renderSettingRow(
        'general',
        settings.general_notifications,
        'general_notifications',
      )}
      {renderSettingRow(
        'reminders',
        settings.reminder_notifications,
        'reminder_notifications',
      )}
      <RoundedButton
        text={
          submitting
            ? t('common.processing')
            : t('notificationSettings.buttons.update')
        }
        onPress={handleUpdate}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default NotificationSettings;
