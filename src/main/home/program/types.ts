import { FastImageProps } from '@d11/react-native-fast-image';
import { TextStyle, ViewStyle } from 'react-native';
import { ThemeType } from '../../../theme';
type FastImageStyle = FastImageProps['style'];

interface Program {
  id: number;
  name: string;
  name_en: string;
  body_region: string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  duration: number;
}

interface ItemStyles {
  newCardContainer: ViewStyle;
  newCardContentLeft: ViewStyle;
  newCardPill: ViewStyle;
  newCardPillText: TextStyle;
  newCardTitle: TextStyle;
  newCardStatsRow: ViewStyle;
  newCardStatItem: ViewStyle;
  newCardStatText: TextStyle;
  newCardImageWrapper: ViewStyle;
  newCardImagePerson: FastImageStyle;
}

interface ProgramProps {
  item: Program;
  onPress: () => void;
  theme: ThemeType;
  styles: ItemStyles;
}

export type { ItemStyles, Program, ProgramProps };

