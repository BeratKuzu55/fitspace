import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { memo } from 'react';
import { View } from 'react-native';
import { dayColor } from '../../../services/program';
import { ThemeType } from '../../../theme';

export const WeeklyIcons = memo(function WeeklyIcons({
  theme,
  program,
  styles,
}: {
  theme: ThemeType;
  program: Program;
  styles: any;
}) {
  return (
    <View style={styles.weeklyIcons}>
      {Array.from({ length: 7 }).map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faCalendar as IconProp}
          size={18}
          color={dayColor(theme, program, i + 1)}
        />
      ))}
    </View>
  );
});
