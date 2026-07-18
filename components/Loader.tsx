import { Animated, Easing } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import type React from 'react';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { AnimationName, LoaderProps } from './types';

const animationMap: Record<
  AnimationName,
  AnimationObject | string | { uri: string }
> = {
  default: require('../src/assets/animations/default.lottie'),
  confetti: require('../src/assets/animations/confetti.lottie'),
};

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const Loader: React.FC<LoaderProps> = ({
  animationName = 'default',
  loop = true,
  autoPlay = true,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const animationProgress = useRef(new Animated.Value(0));

  const animationSource = animationMap[animationName];

  useEffect(() => {
    animationProgress.current.setValue(0);
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [duration, animationName]);

  return (
    <AnimatedLottieView
      style={styles.loader}
      source={animationSource}
      progress={animationProgress.current}
      loop={loop}
      autoPlay={autoPlay}
    />
  );
};

export default Loader;
