import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import RoundedButton from '../../components/RoundedButton';
import useGlobalStyles from '../../styles/styles';
import { api } from '../services/api';
import { useAppDispatch } from '../store';
import { hydrate } from '../store/slices/authSlice';
import { useTheme } from '../theme';
import { AuthStackParamList } from '../types/navigation';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type VerifySmsScreenProps = {
  phoneNumber: string;
  password: string;
  dialCode: string;
  confirm: FirebaseAuthTypes.ConfirmationResult | null;
};

const VerifySmsScreen: React.FC<VerifySmsScreenProps> = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'VerifySms'>>();
  const dispatch = useAppDispatch();

  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);
  const { t } = useTranslation();

  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);

  const { phoneNumber, password, dialCode, confirm } = route.params || {};

  useEffect(() => {
    if (!phoneNumber || !password) {
      showNotification(
        t('auth:_common.errorTitle'),
        t('auth:verifySms.notifications.genericError'),
        'warning',
      );
      navigation.navigate('Login');
    }
  }, [navigation, phoneNumber, password, t]);

  const handleChange = (text: string, index: number) => {
    const updated = smsCode.split('');
    updated[index] = text;
    const newCode = updated.join('');
    setSmsCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };



  const handleSendSms = async () => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      const fullNumber = dialCode.startsWith('+')
        ? `${dialCode}${phoneNumber}`
        : `+${dialCode}${phoneNumber}`;

      // Firebase ile yeni bir SMS kodu talebi
      const newConfirmation = await auth().signInWithPhoneNumber(fullNumber);
      
      // route.params.confirm'i yeni confirmation objesiyle güncelle
      navigation.setParams({ confirm: newConfirmation });

      showNotification(
        t('auth:_common.successTitle'),
        t('auth:verifySms.notifications.codeSent'),
        'success',
      );
    } catch (error) {
      console.error('SMS Tekrar Gönderme Hatası:', error);
      showNotification(
        t('auth:_common.errorTitle'),
        t('auth:verifySms.notifications.genericError'),
        'danger',
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function confirmCode() {
    if (smsCode.length < 6) {
      showNotification(
        t('auth:_common.warningTitle'),
        t('auth:verifySms.notifications.invalidCode'),
        'warning'
      );
      return;
    }

    setIsLoading(true);
    try {
      // 1️⃣ OTP doğrulama, hata durumunda catche düşecek
      await confirm?.confirm(smsCode);

      // 2️⃣ OTP başarılı → idToken al
      const idToken = await auth().currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error('Firebase token alınamadı');
      }

      // 3️⃣ Backend’e gönder
      const response = await api.post('/auth/firebase', {
        firebaseToken: idToken
      });

      const { user_id, auth_token, expire_at } = response.data ?? {};
      if (!auth_token) {
        showNotification(
          t('auth:_common.errorTitle'),
          t('auth:verifySms.notifications.genericError'),
          'danger'
        );
        return;
      }

      // 4️⃣ Local storage ve Redux
      localStorage.set('user_id', String(user_id ?? ''));
      localStorage.set('authToken', auth_token);
      localStorage.set('token_expire_date', String(expire_at ?? ''));

      const hasProfile = !!localStorage.getString('user_profile');

      showNotification(
        t('auth:_common.successTitle'),
        t('auth:verifySms.notifications.success'),
        'success'
      );

      dispatch(
        hydrate({
          token: auth_token,
          onboarded: true,
          setup: !hasProfile,
        })
      );

    } catch (error: any) {
      // 🔴 OTP yanlış veya başka hata → backend çağrısı yapılmaz
      console.log('OTP doğrulama hatası:', error.code || error.message);
      showNotification(
        t('auth:_common.errorTitle'),
        t('auth:verifySms.notifications.invalidCode2'),
        'danger'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleView}>
            <Text style={[styles.titleText, globalStyles.titleFont]}>
              {t('auth:verifySms.heroTitle')}
            </Text>
          </View>

          <View style={styles.inputCardContainer}>
            <Text style={styles.text}>{t('auth:verifySms.instructions')}</Text>
            <Text
              style={[styles.text, styles.agreementLink]}
              onPress={() => handleSendSms()}
            >
              {t('auth:verifySms.resend')}
            </Text>

            <View style={styles.smsCodeContainer}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      if (ref) inputs.current[index] = ref;
                    }}
                    style={styles.smsCodeInput}
                    keyboardType="numeric"
                    maxLength={1}
                    value={smsCode[index] || ''}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === 'Backspace' &&
                        !smsCode[index] &&
                        index > 0
                      ) {
                        inputs.current[index - 1]?.focus();
                      }
                    }}
                  />
                ))}
            </View>

            <RoundedButton
              text={
                isLoading
                  ? t('auth:verifySms.verifying')
                  : t('auth:verifySms.verify')
              }
              onPress={confirmCode}
              disabled={isLoading}
            />

            <RoundedButton
              text={t('auth:verifySms.backToLogin')}
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifySmsScreen;
