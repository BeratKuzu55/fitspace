import {showMessage} from 'react-native-flash-message';

export function showNotification(
  message: string,
  description?: string,
  type: 'success' | 'info' | 'warning' | 'danger' = 'info',
  duration: number = 3000,
) {
  showMessage({
    message,
    description,
    type,
    icon: 'auto',
    duration,
    style: {marginTop: 60, padding: 5, borderWidth: 1},
  });
}
