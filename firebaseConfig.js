import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyArs3IE8Ej3bcWq8WMVkxK8jKXwmuApyXE',
  authDomain: 'exereyes-iuc.firebaseapp.com',
  projectId: 'exereyes-iuc',
  storageBucket: 'exereyes-iuc.appspot.com',
  messagingSenderId: '919229588005',
  appId: '1:919229588005:web:7df27b6711bed3817dd5cc',
  measurementId: 'G-S6WKZNC2NE',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
