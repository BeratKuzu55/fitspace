import { StyleSheet } from 'react-native';
import { ThemeType } from '../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    activeDot: {
      backgroundColor: theme.colors.primary,
      opacity: 1,
      width: 25,
    },
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      paddingVertical: 16,
      width: '100%',
    },
    contentOverlay: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainer + 'D9',
      borderRadius: 32,
      bottom: 50,
      elevation: 5,
      left: 20,
      padding: 24,
      position: 'absolute',
      right: 20,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    dot: {
      backgroundColor: theme.colors.primaryVariant,
      borderRadius: 5,
      height: 10,
      marginHorizontal: 4,
      width: 10,
    },
    image: {
      height: '100%',
      resizeMode: 'cover',
      width: '100%',
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    paginationContainer: {
      flexDirection: 'row',
      marginBottom: 24,
    },
    subtitle: {
      color: theme.colors.primary,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
  });
};

export default useStyles;
