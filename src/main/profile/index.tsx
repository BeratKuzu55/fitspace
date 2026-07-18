import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleQuestion,
  faCogs,
  faDumbbell,
  faSignOutAlt,
  faUser,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../../../components/Alert';
import ProfileButton from '../../../components/ProfileButton';
import ReleaseNotesModal from '../../../components/ReleaseNotesModal';
import { storage } from '../../../firebaseConfig';
import { releaseNotesEN, releaseNotesTR } from '../../constants/releaseNotes';
import i18n from '../../locales/i18n';
import { api } from '../../services/api';
import { useAppDispatch } from '../../store';
import { setToken } from '../../store/slices/authSlice';
import { useTheme } from '../../theme';
import { ProfileStackParamList } from '../../types/navigation'; // Yolunu kontrol edin
import { localStorage } from '../../utils/localStorage';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Props = Record<string, never>;

const ProfileFront: React.FC<Props> = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);
  const isMounted = useRef(true);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setAlertModalOpen] = useState(false);

  const currentLanguage = i18n.language || 'tr';
  const isTurkish = currentLanguage.startsWith('tr');

  const activeData = isTurkish ? releaseNotesTR : releaseNotesEN;
  const modalTitle = isTurkish ? 'Sürüm Geçmişi' : 'Release Notes';
  const linkText = isTurkish ? 'Yenilikler' : "What's New";

  const appVersion = activeData[0]?.version || '0.0.0';

  const displayName = useMemo(() => {
    const f = (firstName ?? '').trim();
    const l = (lastName ?? '').trim();
    const upperL = l ? l.toLocaleUpperCase('tr-TR') : '';
    return (f + ' ' + upperL).trim();
  }, [firstName, lastName]);

  const fetchUserData = useCallback(async () => {
    try {
      const storedUserId = localStorage.getString('user_id');
      if (storedUserId) setUserId(storedUserId);

      const response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (!isMounted.current) return;

      if (response.status === 200 && response.data?.user) {
        const userData = response.data.user;
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        if (userData.profile_image_url)
          setProfileImageUrl(userData.profile_image_url);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchProfileImage = useCallback(async () => {
    try {
      if (userId) {
        const folderRef = ref(storage, 'user-images');
        const listResult = await listAll(folderRef);
        const userFile = listResult.items.find(item =>
          item.name.startsWith(`${userId}`),
        );

        if (!userFile) {
          return;
        }

        const url = await getDownloadURL(userFile);
        setProfileImageUrl(url);
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('profile.notifications.photoMissingTitle'),
        t('profile.notifications.photoMissingMessage'),
        'danger',
      );
    }
  }, [t, userId]);

  const handleLogoutTrigger = () => {
    setAlertModalOpen(true);
  };

  const executeLogout = async () => {
    dispatch(setToken(null));
    const keys = ['user_id', 'authToken', 'token_expire_date', 'user_profile'];
    keys.forEach(k => localStorage.remove(k));
    setAlertModalOpen(false);
    showNotification(t('profile.logoutSuccess'), undefined, 'success');
  };

  useEffect(() => {
    isMounted.current = true;
    fetchUserData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchUserData]);

  useEffect(() => {
    if (userId) {
      fetchProfileImage();
    }
  }, [userId, fetchProfileImage]);

  return (
    <SafeAreaProvider style={styles.safe}>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            <FastImage
              source={
                profileImageUrl
                  ? { uri: profileImageUrl }
                  : require('../../assets/images/profil_foto_default.png')
              }
              style={styles.profileImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
          <Text style={styles.username}>{displayName}</Text>
        </View>

        <View>
          <ProfileButton
            title={t('profile.buttons.updateProfile')}
            icon={faUser as IconProp}
            onPress={() => navigation.navigate('UpdateProfile')}
          />
          <ProfileButton
            title={t('profile.buttons.physicalProfile')}
            icon={faDumbbell as IconProp}
            onPress={() => navigation.navigate('PhysicalProfile')}
          />
          <ProfileButton
            title={t('profile.buttons.settings')}
            icon={faCogs as IconProp}
            onPress={() => navigation.navigate('AppSettings')}
          />
          <ProfileButton
            title={t('profile.buttons.privacy')}
            icon={faUserShield as IconProp}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <ProfileButton
            title={t('profile.buttons.help')}
            icon={faCircleQuestion as IconProp}
            onPress={() => navigation.navigate('HelpContact')}
          />
          <ProfileButton
            title={t('profile.buttons.logout')}
            icon={faSignOutAlt as IconProp}
            onPress={handleLogoutTrigger}
          />
        </View>
        <TouchableOpacity
          style={styles.versionButton}
          onPress={() => setIsModalOpen(true)}
        >
          <Text style={styles.versionText}>v{appVersion}</Text>
          <Text style={styles.linkText}>{linkText}</Text>
        </TouchableOpacity>

        <ReleaseNotesModal
          isVisible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={activeData}
          title={modalTitle}
        />
      </ScrollView>
      <Alert
        visible={isAlertModalOpen}
        title={t('profile.alerts.logoutTitle')}
        message={t('profile.alerts.logoutMessage')}
        theme={theme}
        styles={styles}
        t={t}
        type="googleRed"
        confirmText={t('profile.alerts.logoutConfirm')}
        cancelText={t('profile.alerts.logoutCancel')}
        onConfirm={executeLogout}
        onCancel={() => setAlertModalOpen(false)}
      />
    </SafeAreaProvider>
  );
};

export default ProfileFront;
