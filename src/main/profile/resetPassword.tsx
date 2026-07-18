import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PasswordInput from '../../../components/PasswordInput';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import PasswordRules from '../../../components/PasswordRules';
import { usePasswordRules } from '../../utils/usePasswordRules';

type ResetPasswordProps = Record<string, never>;

const ResetPassword: React.FC<ResetPasswordProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const passwordRules = usePasswordRules({
    password: newPassword,
  });

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification(
        t('profileResetPassword.notifications.warningTitle'),
        t('profileResetPassword.notifications.mismatch'),
        'warning',
      );
      return;
    }

    if (!currentPassword) {
      showNotification(
        t('profileResetPassword.notifications.warningTitle'),
        t('profileResetPassword.notifications.missingCurrent'),
        'warning',
      );
      return;
    }

    if (!newPassword) {
      showNotification(
        t('profileResetPassword.notifications.warningTitle'),
        t('profileResetPassword.notifications.missingNew'),
        'warning',
      );
      return;
    }

    try {
      const payload = {
        old_password: currentPassword,
        new_password: newPassword,
      };

      const response = await api.post('/api/renew_password', payload, {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });
      console.log(response);

      if (response.status === 400) {
        showNotification(
          t('profileResetPassword.title'),
          t('profileResetPassword.notifications.passwordCriteria'),
          'danger',
        );
        return;
      }

      if (response.status === 401) {
        showNotification(
          t('profileResetPassword.title'),
          t('profileResetPassword.notifications.wrongCurrent'),
          'danger',
        );
        return;
      }

      if (response.status >= 200 && response.status < 300) {
        if (response.data?.error !== undefined) {
          showNotification(
            t('profileResetPassword.notifications.updateFailedTitle'),
            t('profileResetPassword.notifications.wrongCurrent'),
            'danger',
          );
        } else {
          showNotification(
            t('profileResetPassword.notifications.updateSuccessTitle'),
            t('profileResetPassword.notifications.updateSuccessMessage'),
            'success',
          );
          navigation.goBack();
        }
        return;
      }

      showNotification(
        t('profileResetPassword.notifications.updateFailedTitle'),
        t('profileResetPassword.notifications.updateFailedMessage'),
        'danger',
      );
    } catch (error) {
      console.error(error);
      showNotification(
        t('profileResetPassword.notifications.updateFailedTitle'),
        t('profileResetPassword.notifications.genericMessage'),
        'danger',
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('profileResetPassword.title')}</Text>
        <View style={styles.inputCardContainer}>
          <PasswordInput
            label={t('profileResetPassword.inputs.current')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordInput
            label={t('profileResetPassword.inputs.new')}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          {newPassword.length > 0 && <PasswordRules rules={passwordRules} />}
          <PasswordInput
            label={t('profileResetPassword.inputs.confirm')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <TouchableOpacity
          style={styles.blackButton}
          onPress={handleResetPassword}
        >
          <Text style={styles.blackButtonText}>
            {t('profileResetPassword.buttons.update')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ResetPassword;
