import { StyleSheet } from 'react-native';
import { ThemeType } from '../../../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    articleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 3,
      flexDirection: 'row',
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: theme.colors.onSurface,
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    articleImage: {
      height: '100%',
      width: '100%',
    },
    articleTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 24,
      marginBottom: 8,
    },
    cardContainer: {
      alignSelf: 'center',
      borderRadius: 20,
      elevation: 8,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: theme.colors.onSurface,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.dark ? 0.5 : 0.15,
      shadowRadius: 8,
      width: '90%',
    },
    cardWrapper: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.textPrimary,
      borderRadius: 20,
      borderWidth: 1,
      overflow: 'hidden',
    },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
    },
    content: {
      color: theme.colors.textPrimary,
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    contentContainer: {
      backgroundColor: theme.colors.surface,
      padding: 16,
    },
    date: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    detailarticleImage: {
      height: 240,
      marginBottom: 0,
      width: '100%',
    },
    detailcontainer: {
      backgroundColor: theme.colors.surface,
      flex: 1,
    },
    detailcontent: {
      color: theme.colors.textPrimary,
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      letterSpacing: 0.2,
      lineHeight: 28,
    },
    detaildate: {
      color: theme.colors.textSecondary,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
      letterSpacing: 0.2,
      marginBottom: 20,
    },
    detailtextContainer: { padding: 16 },
    detailtitle: {
      color: theme.colors.textPrimary,
      fontFamily: 'Poppins-Bold',
      fontSize: 28,
      letterSpacing: 0.3,
      marginBottom: 12,
    },
    emptyContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    header: {
      alignSelf: 'flex-start',
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '800',
      margin: 12,
      textAlign: 'left',
    },
    homeContainer: {
      backgroundColor: theme.colors.surface,
      flex: 1,
    },
    image: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    imageBackground: {
      height: 220,
      width: '100%',
    },
    imageContainer: {
      borderRadius: 12,
      height: 80,
      overflow: 'hidden',
      width: 80,
    },
    listPadding: { paddingBottom: 24, paddingTop: 16 },
    loadingContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      flex: 1,
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.textPrimary,
      fontFamily: 'Poppins-Medium',
      fontSize: 16,
      marginTop: 10,
    },
    summary: {
      color: theme.colors.textSecondary,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
    },
    textContainer: {
      flex: 1,
      padding: 12,
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
