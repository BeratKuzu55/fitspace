import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useTheme } from '../src/theme';

type Props = {
  text: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

const GoogleSignInButton: React.FC<Props> = ({
  text,
  onPress,
  disabled,
  loading,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const isInteractionDisabled = !!disabled || !!loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInteractionDisabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && !isInteractionDisabled && styles.buttonPressed,
        isInteractionDisabled && styles.buttonDisabled,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <FontAwesomeIcon
            icon={faGoogle as unknown as IconProp}
            size={18}
            color="#4285F4"
          />
        </View>
        {loading ? (
          <ActivityIndicator color={theme.colors.textPrimary} />
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}
      </View>
    </Pressable>
  );
};

const useStyles = (theme: any) =>
  StyleSheet.create({
    button: {
      backgroundColor: '#FFFFFF',
      borderColor: theme.colors.divider,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    buttonPressed: {
      opacity: 0.9,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    content: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      width: 22,
    },
    text: {
      color: '#1F1F1F',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default GoogleSignInButton;

