// notification.ts
import { Platform, PermissionsAndroid } from 'react-native';
import { api } from '../services/api';

import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
  AuthorizationStatus,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  setAutoInitEnabled,
} from '@react-native-firebase/messaging';
import { showNotification } from '../utils/notificationHelper';
import i18next from 'i18next'; // ADD THIS: Import global instance
import { localStorage } from '../utils/localStorage';

const submitNotificationSettings = async (
  notificationsEnabled: boolean,
  showToast: boolean = false, // Varsayılan olarak false yaptık
) => {
  try {
    const storedUserId = localStorage.getString('user_id');

    const res = await api.post(
      '/api/user_notification_settings',
      {
        user_id: storedUserId,
        generalNotifications: notificationsEnabled,
        sound: false,
        vibration: false,
        reminderNotifications: notificationsEnabled,
      },
      { requiresAuth: true, validateStatus: s => s < 500 },
    );

    // Sadece showToast true ise ve hata varsa/başarılıysa bildirim göster
    if (showToast) {
      if (res.status === 401) {
        showNotification(
          i18next.t('notificationSettings.notifications.errorTitle'),
          i18next.t('notificationSettings.notifications.sessionRequired'),
          'danger',
        );
        return;
      }

      if (res.status >= 200 && res.status < 300) {
        showNotification(
          i18next.t('notificationSettings.notifications.updateSuccessTitle'),
          i18next.t('notificationSettings.notifications.updateSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          i18next.t('notificationSettings.notifications.errorTitle'),
          i18next.t('notificationSettings.notifications.updateFailed'),
          'danger',
        );
      }
    }

    return res.status >= 200 && res.status < 300; // Başarı durumunu dön
  } catch (error) {
    if (showToast) {
      showNotification(
        i18next.t('notificationSettings.notifications.errorTitle'),
        i18next.t('notificationSettings.notifications.updateFailed'),
        'danger',
      );
    }
    return false;
  }
};

/** ANDROID 13+ için POST_NOTIFICATIONS izni (runtime) */
async function requestAndroidPostNotif(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 33) return true; // Android 12 ve altı: runtime izni yok

  const res = await PermissionsAndroid.request(
    'android.permission.POST_NOTIFICATIONS',
  );
  const ok = res === PermissionsAndroid.RESULTS.GRANTED;
  return ok;
}

/** iOS izinleri */
async function requestIosPermission(
  msg: ReturnType<typeof getMessaging>,
): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;

  const status = await requestPermission(msg);
  const ok =
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL;

  // iOS'ta remote messages kaydı gerekli olabilir
  const reg = await isDeviceRegisteredForRemoteMessages(msg);
  if (!reg) {
    await registerDeviceForRemoteMessages(msg);
  }
  return ok;
}

/** Tek fonksiyon: izinleri al, token üret, sunucuya kaydet */
export async function check_fcm_token(): Promise<string | null> {
  try {
    const app = getApp();
    const msg = getMessaging(app);

    await setAutoInitEnabled(msg, true).catch(() => {});
    const androidOk = await requestAndroidPostNotif();
    if (!androidOk) {
      await submitNotificationSettings(false);
      return null;
    }
    const iosOk = await requestIosPermission(msg);
    if (!iosOk) {
      return null;
    }

    const token = await getToken(msg);
    if (!token) {
      return null;
    }
    await saveTokenToBackend(token);

    const isFcmInitialized = localStorage.getBoolean(
      'fcm_settings_initialized',
    );

    if (!isFcmInitialized) {
      // İlk seferde SESSİZCE (showToast: false) ayarları true yap
      const success = await submitNotificationSettings(true, false);

      if (success) {
        // Sadece başarılı olursa flag'i setle ki hata alırsak bir sonraki girişte tekrar denesin
        localStorage.set('fcm_settings_initialized', true);
      }
    }

    onTokenRefresh(msg, async newToken => {
      try {
        await saveTokenToBackend(newToken);
      } catch (e) {
        console.log('[FCM] onTokenRefresh save error:', e);
      }
    });

    return token;
  } catch (e) {
    console.log('[FCM] check_fcm_token error:', e);
    return null;
  }
}

async function saveTokenToBackend(token: string): Promise<void> {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const res = await api.post(
      '/api/device_tokens',
      { token, platform: Platform.OS, timezone },
      {
        requiresAuth: true,
        validateStatus: s => s < 500,
      },
    );

    if (res.status >= 400) {
      throw new Error(`Backend rejected token with status ${res.status}`);
    }
  } catch (e) {
    console.log('[FCM] saveTokenToBackend error:', e);
    throw e;
  }
}
