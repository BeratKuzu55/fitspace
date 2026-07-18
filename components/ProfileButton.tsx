import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { ProfileButtonProps } from './types';

const ProfileButton: React.FC<ProfileButtonProps> = ({
  title,
  icon,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity style={styles.profileButton} onPress={onPress}>
      <View style={styles.iconwrapper}>
        <FontAwesomeIcon icon={icon} size={24} style={styles.icon} />
      </View>

      <Text style={styles.buttonText}>{title}</Text>
      <FontAwesomeIcon
        icon={faChevronRight as IconProp}
        size={18}
        color={theme.colors.textPrimary}
      />
    </TouchableOpacity>
  );
};
export default ProfileButton;
