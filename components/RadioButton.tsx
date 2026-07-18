import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faDotCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { RadioButtonProps } from './types';

const RadioButton: React.FC<RadioButtonProps> = ({
  title,
  selected,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity style={styles.radiobutton} onPress={onPress}>
      <Text style={styles.radioText}>{title}</Text>
      <FontAwesomeIcon
        icon={selected ? (faDotCircle as IconProp) : (faCircle as IconProp)}
        size={24}
        style={styles.radioIcon}
      />
    </TouchableOpacity>
  );
};

export default RadioButton;
