import { PUBLIC_BASE_URL } from '@env';

export const Config = {
  API_URL: PUBLIC_BASE_URL,
  TIMEOUT: 15000,
};

if (__DEV__) {
  console.log('🛠 Config Loaded:', Config.API_URL);
}
