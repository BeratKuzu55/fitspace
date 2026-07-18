import { localStorage } from '../utils/localStorage';
import { store } from '../store';
import { hydrate } from '../store/slices/authSlice';

export const generateStrongPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!#$%&_+-=;:,.?';

  // Şifre uzunluğu 9-10 karakter arasında rastgele
  const passwordLength = Math.floor(Math.random() * 2) + 9; // 9, 10

  // Özel karakter sayısı 2
  const specialCharCount = 2; // 2 veya 3

  // Önce temel karakterleri ekle (en az birer tane)
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Özel karakterleri ekle (2-3 adet)
  for (let i = 0; i < specialCharCount; i++) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }

  // Kalan karakterler için büyük/küçük harf ve sayı kullan
  const alphanumeric = lowercase + uppercase + numbers;
  const remainingLength = passwordLength - password.length;

  for (let i = 0; i < remainingLength; i++) {
    password += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
  }

  // Karakterleri karıştır (Fisher-Yates shuffle)
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};

export const logoutUser = () => {
  try {
    // 1. MMKV (LocalStorage) Verilerini Temizle
    localStorage.remove('authToken');
    localStorage.remove('token_expire_date');
    localStorage.remove('user_profile');

    // 2. Redux State'ini Sıfırla
    store.dispatch(
      hydrate({
        token: null,
        onboarded: true,
        setup: false,
      }),
    );

    console.log('Kullanıcı oturumu başarıyla sonlandırıldı.');
  } catch (error) {
    console.error('Logout işlemi sırasında hata oluştu:', error);
  }
};
