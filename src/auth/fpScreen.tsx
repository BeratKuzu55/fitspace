import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import useGlobalStyles from '../../styles/styles';
import { useTheme } from '../theme';
import ForgotPass from './forgotPass';
import ResetPass from './resetPass';
import useStyles from './styles';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
export type FPStep = 'forgot' | 'reset';

type VerifySmsScreenProps = {
  confirm: FirebaseAuthTypes.ConfirmationResult | null;
};
type FPScreenProps = Record<string, never>;

const FPScreen: React.FC<FPScreenProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);

  // Merkezi State Yönetimi
  const [step, setStep] = useState<FPStep>('forgot');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedData, setSharedData] = useState<{
    phoneNumber: string;
    dialCode: string;
    confirm: FirebaseAuthTypes.ConfirmationResult | null;
  }>({
    phoneNumber: '',
    dialCode: '',
    confirm: null
  });

  const handleForgotSuccess = (phone: string, dial: string, confirm?: FirebaseAuthTypes.ConfirmationResult | null) => {
    setSharedData({ phoneNumber: phone, dialCode: dial, confirm: confirm || null });
    setStep('reset');
  };

  return (
    <View style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'forgot' ? (
            <ForgotPass
              onSuccess={handleForgotSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <ResetPass
              data={sharedData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default FPScreen;
