import crashlytics from '@react-native-firebase/crashlytics';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import type React from 'react';
import FlashMessage from 'react-native-flash-message';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Loader from './components/Loader';
import AuthLayout from './src/auth/_layout';
import './src/locales/i18n';
import MainLayout from './src/main/_layout';
import OnboardingScreen from './src/onboarding/onboardingScreen';
import { api } from './src/services/api';
import SetupLayout from './src/setup/_layout';
import SplashScreen from './src/splash/splashScreen';
import { store, useAppDispatch, useAppSelector } from './src/store';
import { hydrate } from './src/store/slices/authSlice';
import { ThemeProvider } from './src/theme';
import { initializeMMKV, localStorage } from './src/utils/localStorage';

//import { getApp } from '@react-native-firebase/app';
//import { initializeAppCheck, firebase } from '@react-native-firebase/app-check';

export type RootParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Setup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

type AppContentProps = Record<string, never>;

const AppContent: React.FC<AppContentProps> = () => {
  const dispatch = useAppDispatch();
  const { userToken, hasOnboarded, needsSetup, isLoading } = useAppSelector(
    state => state.auth,
  );
  const [isAppReady, setIsAppReady] = useState(false);

  // Uygulama başladığında bir kez çağırılmalı
  /*const setupAppCheck = async () => {
    const appCheck = firebase.appCheck();
    const rnfbProvider = appCheck.newReactNativeFirebaseAppCheckProvider();

    rnfbProvider.configure({
      android: {
        provider: 'playIntegrity',
      },
    });

    try {
      await appCheck.initializeAppCheck({
        provider: rnfbProvider,
        isTokenAutoRefreshEnabled: true,
      });

      console.log('App Check successfully activated.');
    } catch (error) {
      console.error('App Check error:', error);
    }
  };*/

  useEffect(() => {
    let isMounted = true;

    const bootstrapAsync = async () => {
      try {
        await initializeMMKV();
        const onboardingComplete =
          localStorage.getBoolean('onboardingComplete');
        const token = localStorage.getString('authToken');
        const tokenExpireDate = localStorage.getString('token_expire_date');
        const userProfile = localStorage.getString('user_profile');
        let finalToken = token || null;

        if (tokenExpireDate && finalToken) {
          const expiration = new Date(tokenExpireDate).getTime();
          const now = new Date().getTime();
          const TWO_DAY = 2 * 24 * 60 * 60 * 1000;

          if (expiration < now) {
            finalToken = null;
            localStorage.remove('authToken');
            localStorage.remove('token_expire_date');
          } else if (expiration - now < TWO_DAY) {
            try {
              const response = await api.get('/user/renew_token', {
                requiresAuth: true,
              });

              if (response.status === 200 && isMounted) {
                const newToken = response.data.access_token;
                if (typeof newToken === 'string') {
                  finalToken = newToken;
                  localStorage.set('authToken', newToken);
                  localStorage.set(
                    'token_expire_date',
                    String(response.data.expire_at ?? ''),
                  );
                }
              }
            } catch (error) {
              finalToken = null;
              crashlytics().recordError(
                error instanceof Error ? error : new Error(String(error)),
              );
            }
          }
        }

        if (isMounted) {
          dispatch(
            hydrate({
              token: finalToken,
              onboarded: !!onboardingComplete,
              setup: finalToken ? !userProfile : false,
            }),
          );
          setIsAppReady(true);
        }
      } catch (error) {
        crashlytics().recordError(
          error instanceof Error ? error : new Error(String(error)),
        );
        if (isMounted) {
          dispatch(
            hydrate({
              token: null,
              onboarded: false,
              setup: false,
            }),
          );
          if (isMounted) setIsAppReady(true);
        }
      }
    };

    bootstrapAsync();
    //setupAppCheck();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (!isAppReady) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (isLoading) return <Loader />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : userToken === null ? (
          <Stack.Screen name="Auth" component={AuthLayout} />
        ) : needsSetup ? (
          <Stack.Screen name="Setup" component={SetupLayout} />
        ) : (
          <Stack.Screen name="Main" component={MainLayout} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

type AppProps = Record<string, never>;

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
          <FlashMessage position="top" />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
