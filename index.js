/**
 * @format
 */

import {AppRegistry} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import App from './App';
import {name as appName} from './app.json';

// Crashlytics'i başlat
crashlytics().setCrashlyticsCollectionEnabled(true);

// Global hata yakalama - JavaScript hataları
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  crashlytics().recordError(error);
  if (defaultErrorHandler) {
    defaultErrorHandler(error, isFatal);
  }
});

// Unhandled Promise Rejection yakalama
if (typeof Promise !== 'undefined' && Promise.reject) {
  const defaultPromiseRejectHandler = Promise.reject;
  Promise.reject = function (reason) {
    crashlytics().recordError(
      reason instanceof Error
        ? reason
        : new Error(String(reason)),
    );
    return defaultPromiseRejectHandler.call(this, reason);
  };
}

AppRegistry.registerComponent(appName, () => App);
