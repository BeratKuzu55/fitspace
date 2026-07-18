import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { SegmentSwitchProps } from './types';

const SegmentSwitch: React.FC<SegmentSwitchProps> = ({
  options,
  selected,
  onSelect,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.segmentSwitchContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.segmentSwitchButton,
            selected === option && styles.segmentSwitchButtonSelected,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.segmentSwitchText,
              selected === option && styles.segmentSwitchTextSelected,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SegmentSwitch;
