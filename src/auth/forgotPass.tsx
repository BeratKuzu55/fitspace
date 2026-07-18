import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import DialCodePicker from '../../components/DialCodePicker';
import RoundedButton from '../../components/RoundedButton';
import useGlobalStyles from '../../styles/styles';
import { api } from '../services/api';
import { useTheme } from '../theme';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface ForgotPassProps {
  onSuccess: (phone: string, dial: string, confirm?: FirebaseAuthTypes.ConfirmationResult | null) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const ForgotPass: React.FC<ForgotPassProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialCode, setDialCode] = useState('+90');

  async function signInWithPhoneNumber() {
      if (!phoneNumber) {
        showNotification(
          'Lütfen geçerli bir telefon numarası girin.',
          undefined,
          'warning',
        );
        return;
      }
  
      try {
        setIsLoading(true);
  
        const fullNumber = dialCode.startsWith('+')
          ? `${dialCode}${phoneNumber}`
          : `+${dialCode}${phoneNumber}`;
  
        const confirmation = await auth().signInWithPhoneNumber(fullNumber);
        
        if (confirmation && confirmation.verificationId) {
          showNotification(
            t('auth:login.notifications.smsSentTitle'),
            undefined,
            'success',
          );
        }
        
        onSuccess(phoneNumber, dialCode, confirmation);
        return confirmation;
      } catch (error: any) {
        console.error('SMS Hatası Detayı:', error);
  
        if (error.code === 'auth/app-not-authorized') {
          showNotification(
            t('auth:login.notifications.appNotAuthorized'),
            undefined,
            'danger',
          );
        } else if (error.code === 'auth/too-many-requests') {
          showNotification(
            t('auth:login.notifications.tooManyRequests'),
            undefined,
            'warning',
          );
        } else {
          showNotification(
            t('auth:login.notifications.smsNotSent'),
            undefined,
            'danger',
          );
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    }

  const handleSendCode = async () => {
    // if (phoneNumber.length < 10) {
    //   showNotification(
    //     t('auth:_common.warningTitle'),
    //     t('auth:forgotPassword.notifications.invalidPhone'),
    //     'warning',
    //   );
    //   return;
    // }

    setIsLoading(true);
    try {
      const response = await api.post(
        '/user/forgotpassword',
        { phone_number: phoneNumber, dial_code: dialCode },
        { validateStatus: s => s < 500 },
      );

      if (response.status === 200) {
        showNotification(
          t('auth:forgotPassword.notifications.success'),
          undefined,
          'success',
        );
        onSuccess(phoneNumber, dialCode);
      } else {
        showNotification(
          t('auth:forgotPassword.notifications.notFound'),
          undefined,
          'warning',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('auth:forgotPassword.notifications.genericError'),
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
          {t('auth:forgotPassword.heroTitle')}
        </Text>
      </View>

      <View style={styles.inputCardContainer}>
        <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
          {t('auth:forgotPassword.phoneLabel')}
        </Text>

        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faPhone as IconProp}
            style={styles.inputIcon}
            color={theme.colors.textSecondary}
          />

          <DialCodePicker
            value={dialCode}
            onChange={setDialCode}
            theme={theme}
            styles={styles}
          />

          <TextInput
            style={styles.input}
            placeholder={t('auth:forgotPassword.phonePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={(text: string) => {
              // Sadece rakamları al
              let numericText = text.replace(/[^0-9]/g, '');

              if (numericText.length > 10) {
                numericText = numericText.slice(0, 10);
              }

              setPhoneNumber(numericText);
            }}
          />
        </View>
      </View>
      <RoundedButton
        text={
          isLoading
            ? t('auth:_common.loading')
            : t('auth:forgotPassword.submit')
        }
        onPress={signInWithPhoneNumber}
        disabled={isLoading}
        style={{ backgroundColor: theme.colors.primary }}
      />
    </View>
  );
};

export default ForgotPass;
