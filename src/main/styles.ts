import { StyleSheet } from 'react-native';
import { ThemeType } from '../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.border,
      borderColor: theme.colors.transparent,
      borderRadius: 20,
      borderWidth: 2,
      flexDirection: 'row',
      marginHorizontal: 5,
      marginTop: 8,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    buttonsContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainer,
      borderColor: theme.colors.onSurface,
      borderWidth: 1,
      flexDirection: 'row',
      height: 70,
      justifyContent: 'space-around',
      marginTop: 20,
      paddingHorizontal: 10,
      paddingVertical: 10,
      width: '100%',
    },
    centerIcon: {
      // örn. shadow veya küçük hizalama varsa buraya ekle
    },
    centerIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerIconPause: {
      backgroundColor: theme.colors.transparent,
      borderRadius: 40,
      height: 62,
      resizeMode: 'contain',
      width: 62,
    },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
    },
    footer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.textPrimary,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 14,
    },
    icon: {
      height: 20,
      resizeMode: 'contain',
      width: 20,
    },
    iconButton: {
      padding: 10,
    },
  });
};

export default useStyles;
