import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import PasswordRules from '../../components/PasswordRules';
import RoundedButton from '../../components/RoundedButton';
import useGlobalStyles from '../../styles/styles';
import { api } from '../services/api';
import { useTheme } from '../theme';
import { showNotification } from '../utils/notificationHelper';
import { usePasswordRules } from '../utils/usePasswordRules';
import useStyles from './styles';

interface ResetPassProps {
  data: { phoneNumber: string; dialCode: string; confirm: FirebaseAuthTypes.ConfirmationResult | null };
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const ResetPass: React.FC<ResetPassProps> = ({
  data,
  isLoading,
  setIsLoading,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);

  const [smsCode, setSmsCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordRules = usePasswordRules({
    password: newPassword,
  });

  const handleReset = async () => {
    if (
      smsCode.length === 0 ||
      newPassword.length === 0 ||
      confirmPassword.length === 0
    ) {
      showNotification(
        t('auth:resetPassword.notifications.passwordMismatch'),
        undefined,
        'warning',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification(
        t('auth:resetPassword.notifications.passwordMismatch'),
        undefined,
        'warning',
      );
      return;
    }

    setIsLoading(true);
    try {

      if (data.confirm) {
        await data.confirm.confirm(smsCode);
      }

      // 2️⃣ OTP başarılı → idToken al
      const idToken = await auth().currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error('Firebase token alınamadı');
      }
      const response = await api.post(
        '/user/forgotpassword',
        {
          new_password: newPassword,
          idToken: idToken,
        },
        { validateStatus: s => s < 500 },
      );

      if (response.status >= 200 && response.status < 300) {
        showNotification(
          t('auth:resetPassword.notifications.success'),
          undefined,
          'success',
        );
        navigation.navigate('Login');
      } else {
        // invalid creadentials / sms code is wrong
        if (response.status === 401 && response.data.error) {
          showNotification(response.data.error.message, undefined, 'danger');
          return;
        }
        // password rule violation
        if (response.status === 400 && response.data.error) {
          const details: Array<{ path: string; message: string }> =
            response.data.error.details;
          showNotification(
            details
              ? details.map(d => d.message).join(', ')
              : response.data.error.message,
            undefined,
            'danger',
          );
          return;
        }
        // sms code expired
        if (response.status === 410 && response.data.error) {
          showNotification(response.data.error.message, undefined, 'danger');
          return;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('auth:resetPassword.notifications.failure'),
        undefined,
        'danger',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.titleView}>
        <Text style={[styles.titleText, globalStyles.titleFont]}>
          {t('auth:resetPassword.heroTitle')}
        </Text>
      </View>

      <View style={styles.inputCardContainer}>
        <Text style={[styles.subtitle, globalStyles.titleFont]}>
          {t('auth:resetPassword.subtitle')}
        </Text>
        <Text style={styles.inputInfo}>
          {t('auth:resetPassword.codeLabel')}
        </Text>
        <TextInput
          style={styles.resetpasswordinput}
          placeholder={t('auth:resetPassword.codePlaceholder')}
          value={smsCode}
          onChangeText={setSmsCode}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <PasswordInput
          label={t('auth:resetPassword.passwordLabel')}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {newPassword.length > 0 && <PasswordRules rules={passwordRules} />}
        <PasswordInput
          label={t('auth:resetPassword.confirmPasswordLabel')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <RoundedButton
        text={
          isLoading ? t('auth:_common.loading') : t('auth:resetPassword.submit')
        }
        onPress={handleReset}
        disabled={isLoading}
      />
    </View>
  );
};

export default ResetPass;
