import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faChevronDown,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useState } from 'react';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { AccordionItemProps } from './types';

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.accordionItem}>
      <Pressable
        style={({ pressed }) => [
          styles.accordionHeader,
          expanded && styles.accordionHeaderActive,
          pressed && styles.pressedState,
        ]}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.accordionQuestion}>{question}</Text>
        <FontAwesomeIcon
          icon={(expanded ? faChevronLeft : faChevronDown) as IconProp}
          size={16}
          color={theme.colors.textPrimary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default AccordionItem;
