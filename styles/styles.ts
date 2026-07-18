import { StyleSheet } from 'react-native';
import { ThemeType } from '../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const useGlobalStyles = (theme: ThemeType) => {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    buttonFont: {
      fontSize: 16,
    },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      fontFamily: 'League Spartan',
      paddingBottom: insets.bottom,
      paddingHorizontal: 8,
      paddingTop: insets.top,
    },
    header: {
      alignSelf: 'flex-start',
      color: theme.colors.textPrimary,
      marginVertical: 12,
      textAlign: 'left',
    },
    image: {
      height: '100%',
      width: '100%',
    },
    padding10: {
      padding: 10,
    },
    paddingRight10: {
      paddingRight: 10,
    },
    textFont: { fontSize: 12 },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    titleFont: {
      fontSize: 30,
      fontWeight: 'black',
    },
    titleFontSmall: {
      fontSize: 22,
      fontWeight: 'black',
    },

    titleFontXSmall: {
      fontSize: 20,
      fontWeight: 'black',
    },
  });
};

export default useGlobalStyles;
