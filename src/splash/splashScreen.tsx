import React, { useEffect, useRef } from 'react';
import FastImage from '@d11/react-native-fast-image';
import { Animated, View } from 'react-native';
import useGlobalStyles from '../../styles/styles';
import { useTheme } from '../theme';

const SPLASH_IMAGE = require('../assets/images/splash.jpg');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useTheme();
  const styles = useGlobalStyles(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const timer = setTimeout(() => {
        onFinish();
      }, 1000);

      return () => clearTimeout(timer);
    });
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceContainer }]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <FastImage
          source={SPLASH_IMAGE}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
