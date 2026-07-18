import React from 'react';
import { Pressable, Text } from 'react-native'; // View eklendi
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { SRBProps } from './types';

const SegmentedRadioButton: React.FC<SRBProps> = ({
  title,
  selected,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.segmentedButton,
        selected && styles.segmentedButtonSelected,
        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
      ]}
      onPress={onPress}
      hitSlop={8}
    >
      <Text
        style={[
          styles.segmentedButtonText,
          selected && styles.segmentedButtonTextSelected,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default SegmentedRadioButton;
