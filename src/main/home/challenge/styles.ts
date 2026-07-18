import { StyleSheet } from 'react-native';
import { ThemeType } from '../../../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      padding: 16,
    },
    points: {
      color: theme.colors.primary,
      fontSize: 19,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    rankInfo: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
    },
    rankItem: {
      alignItems: 'center',
      backgroundColor: theme.dark ? theme.colors.surfaceVariant : theme.colors.surfaceContainer,
      borderColor: theme.dark ? theme.colors.border : theme.colors.divider,
      borderRadius: 20,
      borderWidth: 1.5,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      padding: 18,
      shadowColor: theme.colors.onSurface,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: theme.dark ? 0.3 : 0.05,
      shadowRadius: 4,
    },
    rankNumber: {
      fontSize: 32,
      fontWeight: '700',
      marginRight: 14,
      minWidth: 50,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    statsContainer: {
      alignItems: 'flex-end',
      marginLeft: 12,
    },
    title: {
      color: theme.colors.primary,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 28,
      marginTop: 12,
      textAlign: 'center',
    },
    userId: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    userRankBanner: {
      alignItems: 'center',
      backgroundColor: theme.dark ? theme.colors.surfaceVariant : theme.colors.surfaceContainer,
      borderRadius: 16,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    userRankMotivation: {
      color: theme.colors.primary,
      fontSize: 12,
    },
    userRankName: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    userRankOrder: {
      color: theme.colors.primary,
      fontSize: 12,
    },
    userRankRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
    },
    userRankScore: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    workoutCount: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
  });
};

export default useStyles;
