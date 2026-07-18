import { StyleSheet } from 'react-native';
import { ThemeType } from '../../../theme';

const useStyles = (theme: ThemeType) => {
  const markdown = {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 22,
      marginVertical: 4,
      marginHorizontal: 0,
      marginBottom: 20,
    },
    heading1: {
      fontSize: 20,
      fontWeight: '700',
      marginVertical: 10,
      color: theme.colors.textPrimary,
    },
    heading2: {
      fontSize: 17,
      fontWeight: '600',
      marginVertical: 8,
      color: theme.colors.textPrimary,
    },
    strong: {
      fontWeight: '700' as const,
      color: theme.colors.primary,
    },
    list_item: {
      marginLeft: 12,
    },
  };

  const styles = StyleSheet.create({
    aiAnalysisBtn: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      display: 'flex',
      elevation: 3,
      paddingVertical: 12,
      shadowColor: theme.colors.onSurface,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      width: '100%',
    },
    bottomArea: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
      marginTop: 6,
      width: '100%',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      elevation: 3,
      paddingHorizontal: 20,
      paddingVertical: 12,
      shadowColor: theme.colors.onSurface,
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
      opacity: 0.7,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 15,
      fontWeight: '500',
    },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      padding: 16,
    },
    containerinside: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.textPrimary,
      borderRadius: 14,
      borderWidth: 1.2,
      elevation: 3,
      flex: 1,
      padding: 16,
      paddingBottom: 8,
      shadowColor: theme.colors.onSurface,
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: 10,
      borderWidth: 1,
      color: theme.colors.textPrimary,
      flex: 1,
      fontSize: 15,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    loaderContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      minHeight: 200,
      paddingVertical: 40,
    },
    loaderText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '500',
      marginTop: 16,
      textAlign: 'center',
    },
    subLoaderText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 5,
      textAlign: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 20,
      textAlign: 'center',
    },
  });

  return { ...styles, markdown: markdown as any };
};

export default useStyles;
