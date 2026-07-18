import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faEye,
  faEyeSlash,
  faLock,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CustomModal from '../../components/customModal';
import DialCodePicker from '../../components/DialCodePicker';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import RoundedButton from '../../components/RoundedButton';
import useGlobalStyles from '../../styles/styles';
import PrivacyPolicy from '../main/profile/privacyPolicy';
import { api } from '../services/api';
import { useAppDispatch } from '../store';
import { hydrate } from '../store/slices/authSlice';
import { useTheme } from '../theme';
import {
  countryCodeToDialCode,
  detectDeviceCountry,
} from '../utils/deviceCountry';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';
import { primitives } from '../../styles';
import { CLIENT_ID } from '@env';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type LoginScreenProps = Record<string, never>;

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const [dialCode, setDialCode] = useState(() => {
    const deviceCountry = detectDeviceCountry();
    const country = countryCodeToDialCode(deviceCountry);
    return country || '+90';
  });
  const [secure, setSecure] = useState(true);
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn('Google CLIENT_ID .env içinde tanımlı değil.');
      return;
    }

    GoogleSignin.configure({
      webClientId: CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

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

      setConfirm(confirmation);
      showNotification(
        t('auth:login.notifications.smsSentTitle'),
        undefined,
        'success',
      );
      
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

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();

      const idToken = result.data?.idToken || (result as any)?.idToken;

      if (!idToken) {
        console.warn('Google idToken alınamadı');
        return;
      }

      const response = await api.post(
        '/auth/google',
        { idToken },
        { validateStatus: s => s < 500 },
      );

      if (response.status == 409 || !response.data?.auth_token) {
        showNotification(
          t('auth:login.notifications.existAccount'),
          undefined,
          'danger',
        );
        return;
      }

      if (response.status !== 200 || !response.data?.auth_token) {
        showNotification(
          t('auth:login.notifications.genericError'),
          undefined,
          'danger',
        );
        return;
      }

      const { auth_token, user_id, expire_at } = response.data;

      localStorage.set('user_id', String(user_id ?? ''));
      localStorage.set('authToken', auth_token);
      localStorage.set('token_expire_date', String(expire_at ?? ''));

      showNotification(
        t('auth:login.notifications.success'),
        undefined,
        'success',
      );

      const user_profile_response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      console.log('user :', user_profile_response);
      if (
        user_profile_response.status === 200 &&
        !user_profile_response.data?.error
      ) {
        if (user_profile_response.data.user.age) {
          console.log('user age', user_profile_response.data.user.age);

          localStorage.set(
            'user_profile',
            JSON.stringify(user_profile_response.data?.user ?? {}),
          );
        }
      } else {
        console.error('Profile fetch failed during login');
      }

      const hasProfile = !!localStorage.getString('user_profile');

      setTimeout(() => {
        dispatch(
          hydrate({
            token: auth_token,
            onboarded: true,
            setup: !hasProfile,
          }),
        );
      }, 400);
    } catch (error) {
      console.log('Google login error', error);
      showNotification(
        t('auth:login.notifications.genericError'),
        undefined,
        'danger',
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }, [dispatch, t]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(
        '/user/login',
        { phone_number: phoneNumber, password, dial_code: dialCode },
        { validateStatus: s => s < 500 },
      );

      // 1. Hata Kontrolleri (Mevcut mantığınızı koruyoruz)
      if (response.status === 401 || response.data?.error) {
        const isDeactivated = response.data?.error?.type === 'UserDeactivated';
        showNotification(
          t(
            isDeactivated
              ? 'auth:login.notifications.deactivated'
              : 'auth:login.notifications.invalidCredentials',
          ),
          undefined,
          'warning',
        );
        return;
      }

      if (response.status !== 200) {
        const isNotFound = response.data?.error?.type === 'NotFound';
        showNotification(
          t(
            isNotFound
              ? 'auth:login.notifications.userNotFoundTitle'
              : 'auth:login.notifications.genericError',
          ),
          isNotFound
            ? t('auth:login.notifications.userNotFoundMessage')
            : undefined,
          isNotFound ? 'warning' : 'danger',
        );
        return;
      }

      // 2. SMS Doğrulama Senaryosu
      if (
        response.data?.message ===
        'loginRoutes.smsRequest.Success.SMSVerificationRequired'
      ) {
        const confirmation = await signInWithPhoneNumber();
        
        if (!confirmation) {
          // Eğer SMS gönderilemediyse işleme devam etme
          return;
        }

        localStorage.set('temp_phone_number', phoneNumber);
        localStorage.set('temp_password', password);
        localStorage.set('temp_dial_code', dialCode);

        navigation.navigate('VerifySms', {
          phoneNumber: phoneNumber,
          password: password,
          dialCode: dialCode,
          confirm: confirmation, // Use the returned confirmation, old state was null!
        });
        return;
      }

      // 3. Başarılı Giriş ve Token İşlemleri
      const { user_id, auth_token, expire_at } = response.data ?? {};
      if (!auth_token) {
        showNotification(
          t('auth:login.notifications.missingToken'),
          undefined,
          'danger',
        );
        return;
      }

      localStorage.set('user_id', String(user_id ?? ''));
      localStorage.set('authToken', auth_token);
      localStorage.set('token_expire_date', String(expire_at ?? ''));

      const user_profile_response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (
        user_profile_response.status === 200 &&
        !user_profile_response.data?.error
      ) {
        localStorage.set(
          'user_profile',
          JSON.stringify(user_profile_response.data?.user ?? {}),
        );
      } else {
        console.error('Profile fetch failed during login');
      }

      // 5. Temizlik ve Redux Dispatch (KRİTİK NOKTA)
      localStorage.remove('temp_phone_number');
      localStorage.remove('temp_password');
      localStorage.remove('temp_dial_code');

      showNotification(
        t('auth:login.notifications.success'),
        undefined,
        'success',
      );

      const hasProfile = !!localStorage.getString('user_profile');

      setTimeout(() => {
        dispatch(
          hydrate({
            token: auth_token,
            onboarded: true,
            setup: !hasProfile,
          }),
        );
      }, 400);
    } catch (error) {
      showNotification(
        t('auth:login.notifications.genericError'),
        undefined,
        'danger',
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Text style={[styles.titleText, globalStyles.titleFont , {fontFamily: 'Fredoka-Light'}]}>
              {t('auth:login.heroTitle')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navigationView}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.navigationText}>
              {t('auth:login.noAccount')}{' '}
              <Text style={[{fontFamily: 'Fredoka-Light'}, styles.registerLink]}>
                {t('auth:login.createAccount')}
              </Text>
            </Text>
          </TouchableOpacity> 

          <View style={styles.inputCardContainer}>
            <Text style={[styles.subtitle, globalStyles.titleFont]}>
              {t('auth:login.formTitle')}
            </Text>
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:login.phoneLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faPhone as IconProp}
                style={styles.inputIcon}
              />
              <DialCodePicker
                value={dialCode}
                onChange={setDialCode}
                theme={theme}
                styles={styles}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:login.phonePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={(text: string) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(numericText);
                }}
                maxLength={15}
              />
            </View>

            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:login.passwordLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faLock as IconProp}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:login.passwordPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <FontAwesomeIcon
                  icon={secure ? (faEye as IconProp) : (faEyeSlash as IconProp)}
                  size={18}
                  color={primitives.slate300}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('FPScreen')}>
              <Text style={styles.forgotPasswordText}>
                {t('auth:login.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>
          <RoundedButton
            text={
              isLoading ? t('auth:login.signingIn') : t('auth:login.signIn')
            }
            style={{ backgroundColor: theme.colors.primary }}
            onPress={handleLogin}
            disabled={isLoading || isGoogleLoading}
          />

          <View style={{ marginTop: 16 }}>
            <GoogleSignInButton
              text={t('auth:login.googleSignIn')}
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              loading={isGoogleLoading}
            />
          </View>

          <View style={styles.agreementContainer}>
            <Text style={styles.agreementText}>
              {t('auth:login.terms.prefix')}{' '}
              <Text
                style={styles.agreementLink}
                onPress={() => setIsTermsVisible(true)}
              >
                {t('auth:_common.termsLink')}
              </Text>{' '}
              {t('auth:login.terms.and')}{' '}
              <Text
                style={styles.agreementLink}
                onPress={() => setIsPrivacyPolicyVisible(true)}
              >
                {t('auth:_common.privacyLink')}
              </Text>{' '}
              {t('auth:login.terms.suffix')}
            </Text>
          </View>
          <CustomModal
            visible={isTermsVisible}
            setVisible={setIsTermsVisible}
            title={t('auth:login.modals.termsTitle')}
            text={t('auth:login.modals.termsBody')}
          />
          <CustomModal
            visible={isPrivacyPolicyVisible}
            setVisible={setIsPrivacyPolicyVisible}
            title={t('auth:login.modals.privacyTitle')}
          >
            <PrivacyPolicy showContainer={false} />
          </CustomModal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
