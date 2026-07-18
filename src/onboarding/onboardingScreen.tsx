import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FastImage from '@d11/react-native-fast-image';
import { Text, View } from 'react-native';
import RoundedButton from '../../components/RoundedButton';
import useGlobalStyles from '../../styles/styles';
import { useAppDispatch } from '../store';
import { completeOnboarding } from '../store/slices/authSlice';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';

const ONBOARDING_DATA = [
  {
    id: 1,
    image: require('../assets/images/onboard/1.workouts.png'),
    subtitleKey: 'onboarding.screen1.subtitle',
  },
  {
    id: 2,
    image: require('../assets/images/onboard/2.exerai.png'),
    subtitleKey: 'onboarding.screen2.subtitle',
  },
  {
    id: 3,
    image: require('../assets/images/onboard/3.program.png'),
    subtitleKey: 'onboarding.screen3.subtitle',
  },
  {
    id: 4,
    image: require('../assets/images/onboard/4.ladder.png'),
    subtitleKey: 'onboarding.screen4.subtitle',
  },
];

import type React from 'react';

type Props = Record<string, never>;

const OnboardingScreen: React.FC<Props> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const currentStep = ONBOARDING_DATA[currentIndex];
  const isLastStep = currentIndex === ONBOARDING_DATA.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinishOnboarding();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const onFinishOnboarding = () => {
    try {
      localStorage.set('onboardingComplete', true);
      dispatch(completeOnboarding());
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      showNotification(
        'Hata',
        'Bir sorun oluştu. Lütfen tekrar deneyin.',
        'danger',
      );
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Arka Plan Görseli */}
      <View style={styles.imageContainer}>
        <FastImage
          source={currentStep.image}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>

      {/* Görselin Üzerindeki İçerik Kartı */}
      <View style={styles.contentOverlay}>
        <Text style={styles.subtitle}>{t(currentStep.subtitleKey)}</Text>
        <View style={styles.paginationContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
        <RoundedButton
          text={isLastStep ? t('onboarding.start') : t('onboarding.next')}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
};

export default OnboardingScreen;
