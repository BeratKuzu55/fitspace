import React from 'react';
import {
  Text,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { RBProps } from './types';

const RoundedButton: React.FC<RBProps> = ({
  text,
  onPress,
  style,
  disabled,
  loading,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const isInteractionDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }): StyleProp<ViewStyle> => [
        styles.roundedButton,
        pressed && styles.roundedButtonPressed,
        style as ViewStyle,
        isInteractionDisabled && styles.roundedButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isInteractionDisabled}
      hitSlop={8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <Text style={styles.roundedButtonText}>{text}</Text>
      )}
    </Pressable>
  );
};

export default RoundedButton;
