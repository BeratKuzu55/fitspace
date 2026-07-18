import { StyleSheet } from 'react-native';
import { ThemeType } from '../../../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    loaderContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      alignSelf: 'center',
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });
};

export default useStyles;
