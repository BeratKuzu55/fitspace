import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { PasswordInputProps } from './types';

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          secureTextEntry={secure}
          placeholder={t('auth:resetPassword.codePlaceholder')}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Pressable
          onPress={() => setSecure(!secure)}
          style={({ pressed }) => [
            styles.iconContainer,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <FontAwesomeIcon
            icon={(secure ? faEye : faEyeSlash) as IconProp}
            size={18}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default PasswordInput;
