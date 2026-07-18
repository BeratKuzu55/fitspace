import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ThemeType } from '../src/theme';
import useStyles from './component_styles';

interface TabProps {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ThemeType;
}

export const ChartTab = React.memo(
  ({ label, active, onPress, theme }: TabProps) => {
    const styles = useStyles(theme);
    return (
      <TouchableOpacity
        onPress={onPress}
        style={active ? styles.tabActive : styles.tabIdle}
      >
        <Text style={styles.tabText}>{label}</Text>
      </TouchableOpacity>
    );
  },
);
