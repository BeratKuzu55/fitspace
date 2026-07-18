import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { ProgressIndicatorProps } from './types';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  totalSteps,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  return (
    <View style={styles.progressIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index < step ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};
