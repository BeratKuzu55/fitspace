import * as Keychain from 'react-native-keychain';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
const SERVICE_NAME = 'exereyes_secure_storage';
const ACCOUNT_NAME = 'encryption_vault';

export const getOrCreateEncryptionKey = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });

    if (credentials) return credentials.password;

    const newKey = uuidv4();
    await Keychain.setGenericPassword(ACCOUNT_NAME, newKey, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // Ekstra güvenlik
    });

    return newKey;
  } catch (error) {
    console.error('Keychain Error:', error);
    return null;
  }
};
