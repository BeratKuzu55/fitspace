import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCheck,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faPhone,
  faRefresh,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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
import DialCodePicker from '../../components/DialCodePicker';
import RoundedButton from '../../components/RoundedButton';
import CustomModal from '../../components/customModal';
import useGlobalStyles from '../../styles/styles';
import { detectDeviceLanguage } from '../locales/i18n';
import PrivacyPolicy from '../main/profile/privacyPolicy';
import { api } from '../services/api';
import { generateStrongPassword } from '../services/auth';
import { useTheme } from '../theme';
import {
  countryCodeToDialCode,
  detectDeviceCountry,
} from '../utils/deviceCountry';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';
import { primitives } from '../../styles';
import PasswordRules from '../../components/PasswordRules';
import { usePasswordRules } from '../utils/usePasswordRules';

type RegisterScreenProps = Record<string, never>;

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);
  const { t } = useTranslation();

  const [first_name, setName] = useState('');
  const [last_name, setSurname] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const [dialCode, setDialCode] = useState(() => {
    const deviceCountry = detectDeviceCountry();
    const country = countryCodeToDialCode(deviceCountry);
    return country || '+90';
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  
  const passwordRules = usePasswordRules({
    password,
    firstName: first_name,
    lastName: last_name,
    email,
    fullName,
  });
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showNotification(
        t('auth:register.notifications.failure'),
        t('auth:register.errors.passwordMismatch'),
        'warning',
      );
      return;
    }

    setIsLoading(true);
    const device_language = detectDeviceLanguage();
    const _language = device_language === 'tr' ? 'TR' : 'EN';
    try {
      const response = await api.post(
        '/user/register',
        {
          first_name,
          last_name,
          email,
          phone_number: phoneNumber,
          password,
          language: _language,
          gdpr_consent: true,
          dial_code: dialCode,
          terms_of_service: termsAccepted,
          privacy_policy: privacyPolicyAccepted,
        },
        {
          validateStatus: s => s < 500,
        },
      );

      if (
        response.status >= 200 &&
        response.status < 300 &&
        !response.data?.error
      ) {
        showNotification(
          t('auth:register.notifications.success'),
          undefined,
          'success',
        );
        navigation.navigate('Login');
        return;
      }

      const serverMsg =
        response.data?.error?.message ||
        response.data?.message ||
        (response.status === 409
          ? t('auth:register.notifications.emailInUse')
          : response.status === 422
            ? t('auth:register.notifications.failure')
            : t('auth:register.notifications.failure'));

      showNotification(
        t('auth:register.notifications.failure'),
        serverMsg,
        'danger',
      );
    } catch {
      showNotification(
        t('auth:register.notifications.failure'),
        undefined,
        'danger',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullNameChange = (text: string) => {
    setFullName(text);
    const names = text.trim().split(' ');
    if (names.length === 1) {
      setName(names[0]);
      setSurname('');
    } else {
      const lastName = names.pop();
      const firstName = names.join(' ');
      setName(firstName);
      setSurname(lastName || '');
    }
  };

  const handleSuggestPassword = () => {
    const suggestedPassword = generateStrongPassword();
    setPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
    showNotification(
      t('auth:register.passwordRules.passwordSuggested'),
      undefined,
      'success',
    );
    setTimeout(() => {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 5000);
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
            <Text style={[styles.titleText, globalStyles.titleFont]}>
              {t('auth:register.heroTitle')}
            </Text>
          </View>
          <View style={styles.inputCardContainer}>
            <Text style={[styles.subtitle, globalStyles.titleFont]}>
              {t('auth:register.formTitle')}
            </Text>
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:register.fullNameLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faUser as IconProp}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:register.fullNamePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={fullName}
                onChangeText={handleFullNameChange}
              />
            </View>
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:register.emailLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faEnvelope as IconProp}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:register.emailPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:register.phoneLabel')}
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
                placeholder={t('auth:register.phonePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={phoneNumber}
                onChangeText={text => {
                  const formatted = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(formatted);
                }}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:register.passwordLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faLock as IconProp}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:register.passwordPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordVisibilityButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesomeIcon
                  icon={
                    showPassword
                      ? (faEyeSlash as IconProp)
                      : (faEye as IconProp)
                  }
                  size={16}
                  color={primitives.slate300}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSuggestPassword}
                style={styles.suggestPasswordButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesomeIcon
                  icon={faRefresh as IconProp}
                  size={16}
                  color={primitives.slate300}
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
                <PasswordRules rules={passwordRules} />
            )}
            <Text style={[styles.inputInfo, globalStyles.buttonFont]}>
              {t('auth:register.confirmPasswordLabel')}
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faLock as IconProp}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth:register.confirmPasswordPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordVisibilityButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesomeIcon
                  icon={
                    showConfirmPassword
                      ? (faEyeSlash as IconProp)
                      : (faEye as IconProp)
                  }
                  size={16}
                  color={primitives.slate300}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked,
                    { borderColor: theme.colors.primary },
                  ]}
                >
                  {termsAccepted && (
                    <FontAwesomeIcon
                      icon={faCheck as IconProp}
                      size={12}
                      color={theme.colors.onPrimary}
                    />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, globalStyles.buttonFont]}>
                  {t('auth:register.terms.prefix')}{' '}
                  <Text
                    style={styles.agreementLink}
                    onPress={() => setIsTermsVisible(true)}
                  >
                    {t('auth:_common.termsLink')}
                  </Text>{' '}
                  {t('auth:register.terms.suffix')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
              >
                <View
                  style={[
                    styles.checkbox,
                    privacyPolicyAccepted && styles.checkboxChecked,
                    { borderColor: theme.colors.primary },
                  ]}
                >
                  {privacyPolicyAccepted && (
                    <FontAwesomeIcon
                      icon={faCheck as IconProp}
                      size={12}
                      color={theme.colors.onPrimary}
                    />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, globalStyles.buttonFont]}>
                  {t('auth:register.terms.prefix')}{' '}
                  <Text
                    style={styles.agreementLink}
                    onPress={() => setIsPrivacyPolicyVisible(true)}
                  >
                    {t('auth:_common.privacyLink')}{' '}
                  </Text>
                  {t('auth:register.terms.suffix')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <RoundedButton
            text={
              isLoading
                ? t('auth:register.signingUp')
                : t('auth:register.signUp')
            }
            style={{ backgroundColor: theme.colors.primary }}
            onPress={handleRegister}
            disabled={isLoading || !termsAccepted || !privacyPolicyAccepted}
          />
          <TouchableOpacity
            style={styles.navigationView}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.navigationText}>
              {t('auth:register.alreadyHaveAccount')}{' '}
              <Text style={styles.registerLink}>
                {t('auth:register.login')}
              </Text>
            </Text>
          </TouchableOpacity>
          <CustomModal
            visible={isTermsVisible}
            setVisible={setIsTermsVisible}
            title={t('auth:register.modals.termsTitle')}
            text={t('auth:register.modals.termsBody')}
          />
          <CustomModal
            visible={isPrivacyPolicyVisible}
            setVisible={setIsPrivacyPolicyVisible}
            title={t('auth:register.modals.privacyTitle')}
          >
            <PrivacyPolicy showContainer={false} />
          </CustomModal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
