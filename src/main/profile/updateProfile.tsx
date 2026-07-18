import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RoundedButton from '../../../components/RoundedButton';
import { storage } from '../../../firebaseConfig';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { localStorage } from '../../utils/localStorage';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

type UpdateProfileProps = Record<string, never>;

const UpdateProfile: React.FC<UpdateProfileProps> = () => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const fetchUserData = useCallback(async () => {
    try {
      const storedUserId = localStorage.getString('user_id');
      if (storedUserId) setUserId(storedUserId);

      const res = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (res.status !== 200 || !res.data?.user) {
        showNotification(
          t('updateProfile.notifications.errorTitle'),
          t('updateProfile.notifications.infoFetchFailed'),
          'danger',
        );
        return;
      }

      const u = res.data.user;
      setFirstName(u.first_name ?? '');
      setLastName(u.last_name ?? '');
      setAge(Number.isFinite(Number(u.age)) ? Number(u.age) : null);
      setWeight(Number.isFinite(Number(u.weight)) ? Number(u.weight) : null);
      setHeight(Number.isFinite(Number(u.height)) ? Number(u.height) : null);
      setEmail(u.email ?? '');
      setPhone(u.phone_number ?? '');
      if (u.profile_image_url) setProfileImageUrl(u.profile_image_url);
    } catch (error) {
      console.error(error);
      showNotification(
        t('updateProfile.notifications.errorTitle'),
        t('updateProfile.notifications.generic'),
        'danger',
      );
    }
  }, [t]);

  const fetchProfileImage = useCallback(async () => {
    try {
      if (userId) {
        const folderRef = ref(storage, 'user-images');
        const listResult = await listAll(folderRef); // dosyaların uzantılarını bilmediğimiz için listAll kullanıyoruz
        //listAll() fonksiyonu ile user-images/ klasöründeki tüm dosyaları listeleyip, userId içeren dosya adını buluyoruz
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
        t('updateProfile.notifications.photoMissingTitle'),
        t('updateProfile.notifications.photoMissingMessage'),
        'danger',
      );
    }
  }, [t, userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userId) {
      fetchProfileImage();
    }
  }, [fetchProfileImage, userId]);

  const selectProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 1,
    });

    if (result.didCancel) {
      showNotification(
        t('updateProfile.notifications.selectCancelledTitle'),
        t('updateProfile.notifications.selectCancelledMessage'),
        'info',
      );
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      showNotification(
        t('updateProfile.notifications.errorTitle'),
        t('updateProfile.notifications.selectFailed'),
        'danger',
      );
      return;
    }

    const isAllowed =
      asset?.fileName?.toLowerCase().endsWith('.jpeg') ||
      asset?.fileName?.toLowerCase().endsWith('.jpg') ||
      asset?.fileName?.toLowerCase().endsWith('.png');

    if (!isAllowed) {
      showNotification(
        t('updateProfile.notifications.errorTitle'),
        'Media not supported. Please choose JPEG or PNG.',
        'danger',
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName || 'profile.jpg',
      type: asset.type || 'image/jpeg',
    } as unknown);
    formData.append('id', String(userId));
    formData.append('target_entity', 'User');

    try {
      const res = await api.post('/api/file_upload', formData, {
        requiresAuth: true,
        validateStatus: s => s < 500,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        showNotification(
          t('updateProfile.notifications.uploadSuccessTitle'),
          t('updateProfile.notifications.uploadSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          t('updateProfile.notifications.errorTitle'),
          t('updateProfile.notifications.uploadFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('updateProfile.notifications.errorTitle'),
        t('updateProfile.notifications.uploadFailed'),
        'danger',
      );
    }
  };

  const handleUpdateProfile = async () => {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      age,
      weight,
      height,
      phone_number: phone,
    };

    try {
      const res = await api.post('/api/user', payload, {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (res.status >= 200 && res.status < 300) {
        showNotification(
          t('updateProfile.notifications.updateSuccessTitle'),
          t('updateProfile.notifications.updateSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          t('updateProfile.notifications.errorTitle'),
          t('updateProfile.notifications.updateFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('updateProfile.notifications.errorTitle'),
        t('updateProfile.notifications.updateError'),
        'danger',
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={styles.profileImageContainer}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require('../../assets/images/profil_foto_default.png')
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            onPress={selectProfileImage}
            style={styles.editIconBadge}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon
              icon={faCamera as IconProp}
              size={16}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.username}>
          {firstName + ' ' + lastName.toUpperCase()}
        </Text>
      </View>
      <View style={styles.infoBlock}>
        <View style={styles.infoItem}>
          <TextInput
            style={styles.infoValue}
            placeholder={t('updateProfile.placeholders.weight')}
            keyboardType="numeric"
            value={weight ? String(weight) : ''}
            onChangeText={text => setWeight(Number(text))}
          />
          <Text style={styles.infoLabel}>
            {t('updateProfile.labels.weight')}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <TextInput
            style={styles.infoValue}
            placeholder={t('updateProfile.placeholders.age')}
            keyboardType="numeric"
            value={age ? String(age) : ''}
            onChangeText={text => setAge(Number(text))}
          />
          <Text style={styles.infoLabel}>{t('updateProfile.labels.age')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <TextInput
            style={styles.infoValue}
            placeholder={t('updateProfile.placeholders.height')}
            keyboardType="numeric"
            value={height ? String(height) : ''}
            onChangeText={text => setHeight(Number(text))}
          />
          <Text style={styles.infoLabel}>
            {t('updateProfile.labels.height')}
          </Text>
        </View>
      </View>

      <View style={styles.formBlock}>
        <Text style={styles.label}>{t('updateProfile.labels.fullName')}</Text>
        <TextInput style={styles.input} editable={false}>
          {firstName + ' ' + lastName}
        </TextInput>
        <Text style={styles.label}>{t('updateProfile.labels.email')}</Text>
        <TextInput style={styles.input}>{email}</TextInput>
        <Text style={styles.label}>{t('updateProfile.labels.phone')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('updateProfile.placeholders.phone')}
          value={phone}
          onChangeText={text => setPhone(text)}
          editable={false}
        />
      </View>
      <RoundedButton
        text={t('updateProfile.buttons.update')}
        onPress={handleUpdateProfile}
      />
    </ScrollView>
  );
};

export default UpdateProfile;
