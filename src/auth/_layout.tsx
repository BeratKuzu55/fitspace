import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderProvider } from '../main/HeaderContext';
import FPScreen from './fpScreen';
import Login from './login';
import Register from './register';
import VerifySms from './verify_sms';

const Stack = createNativeStackNavigator();

type AuthLayoutProps = Record<string, never>;

const AuthLayout: React.FC<AuthLayoutProps> = () => {
  return (
    <HeaderProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="FPScreen" component={FPScreen} />
        <Stack.Screen name="VerifySms" component={VerifySms} />
      </Stack.Navigator>
    </HeaderProvider>
  );
};

export default AuthLayout;
