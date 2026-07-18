import { createMMKV, MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

let storage: MMKV | null = null;

const getSecureKey = async (): Promise<string> => {
  const serviceName = 'app_mmkv_secure_key';
  try {
    const credentials = await Keychain.getGenericPassword({
      service: serviceName,
    });
    if (credentials) return credentials.password;

    const newKey = [...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join('');
    await Keychain.setGenericPassword('mmkv_user', newKey, {
      service: serviceName,
    });
    return newKey;
  } catch (error) {
    throw new Error('Keychain hatası: ' + error);
  }
};

export const initializeMMKV = async () => {
  if (storage) return;

  try {
    const encryptionKey = await getSecureKey();

    // MMKV v4 createMMKV kullanımı
    storage = createMMKV({
      id: 'user-secure-storage',
      encryptionKey: encryptionKey,
      mode: 'multi-process',
    });
  } catch (e) {
    console.error('MMKV başlatma hatası:', e);
    storage = createMMKV({ id: 'user-secure-storage' });
  }
};

// Hata fırlatmak yerine null kontrolü yapan yardımcı
const safeStorage = () => {
  if (!storage) {
    // Burada hata fırlatmak yerine uyarı verip null dönebiliriz
    // veya uygulamanın en başında init bittiğinden emin olmalıyız.
    return null;
  }
  return storage;
};

export const localStorage = {
  set: (key: string, value: string | number | boolean) =>
    safeStorage()?.set(key, value),
  getString: (key: string) => safeStorage()?.getString(key),
  getNumber: (key: string) => safeStorage()?.getNumber(key),
  getBoolean: (key: string) => safeStorage()?.getBoolean(key),
  remove: (key: string) => safeStorage()?.remove(key),
  clearAll: () => safeStorage()?.clearAll(),
};
