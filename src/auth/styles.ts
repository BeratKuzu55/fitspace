import { StyleSheet } from 'react-native';
import { ThemeType } from '../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    agreementContainer: {
      marginTop: 20,
      paddingHorizontal: 10,
    },
    agreementLink: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    agreementText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
    },
    appleButton: {
      alignItems: 'center',
      backgroundColor: theme.dark
        ? theme.colors.surfaceContainer
        : theme.colors.onSurface,
      borderRadius: 50,
      elevation: 3,
      justifyContent: 'center',
      marginHorizontal: 6,
      padding: 14,
    },
    cancelBtn: {
      alignSelf: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    checkbox: {
      alignItems: 'center',
      borderRadius: 4,
      borderWidth: 2,
      height: 20,
      justifyContent: 'center',
      marginRight: 10,
      marginTop: 2,
      width: 20,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxContainer: {
      marginBottom: 20,
      marginTop: 10,
      paddingHorizontal: 10,
    },
    checkboxLabel: {
      color: theme.colors.textPrimary,
      flex: 1,
      fontSize: 12,
    },
    checkboxRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginVertical: 8,
    },
    countryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      paddingVertical: 12,
    },
    countryText: {
      fontSize: 16,
    },
    dialButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      gap: 8,
      marginLeft: 2,
      marginRight: 2,
      paddingHorizontal: 2,
    },
    dialText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '500',
    },
    facebookButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.facebookBlue,
      borderRadius: 50,
      elevation: 3,
      justifyContent: 'center',
      marginHorizontal: 6,
      padding: 14,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: 600,
      marginVertical: 12,
      padding: 8,
    },
    googleButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 50,
      elevation: 3,
      justifyContent: 'center',
      marginHorizontal: 6,
      padding: 14,
    },
    input: {
      color: theme.colors.textPrimary,
      flex: 1,
      fontSize: 16,
    },
    inputCardContainer: {
      backgroundColor: theme.colors.backgroundOverlay,
      borderRadius: 20,
      borderWidth: 0,
      elevation: 2,
      marginVertical: 20,
      padding: 20,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    inputContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      flexDirection: 'row',
      height: 60,
      marginVertical: 10,
      paddingHorizontal: 12,
    },
    inputIcon: {
      color: theme.colors.primary,
      marginLeft: 5,
      marginRight: 10,
    },
    inputInfo: {
      color: theme.colors.primary,
      marginBottom: 10,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    line: {
      backgroundColor: theme.colors.textPrimary,
      flex: 1,
      height: 1,
    },
    modalBackdrop: {
      backgroundColor: theme.colors.backdrop,
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalCard: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '85%',
      padding: 16,
    },
    modalFooter: {
      alignItems: 'flex-end',
      paddingTop: 12,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    navigationText: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      textAlign: 'center',
      fontFamily: 'Fredoka-Light'
    },
    navigationView: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 24,
      paddingHorizontal: 10,
    },
    passwordRuleIcon: {
      alignItems: 'center',
      marginRight: 8,
      width: 16,
    },
    passwordRuleItem: {
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 4,
    },
    passwordRuleText: {
      color: theme.dark ? theme.colors.onPrimary : theme.colors.textPrimary,
      flex: 1,
      fontSize: 11,
      lineHeight: 16,
    },
    passwordRulesContainer: {
      backgroundColor: theme.colors.backdrop,
      borderColor: theme.colors.textPrimary,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 8,
      marginTop: 8,
      padding: 12,
    },
    passwordRulesTitle: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    passwordVisibilityButton: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    },
    phoneInputBox: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      height: 50,
      marginRight: 12,
    },
    registerLink: {
      color: theme.colors.primary,
      fontSize: 24,
      textDecorationLine: 'underline',
      fontFamily: 'Fredoka-Medium'
    },
    resetpasswordinput: {
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 15,
      color: theme.colors.textPrimary,
      elevation: 3,
      fontSize: 16,
      marginBottom: 10,
      padding: 10,
      paddingVertical: 13,
    },
    roundedButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.onSurface,
      borderRadius: 100,
      marginVertical: 10,
      paddingVertical: 15,
    },
    safeAreaView: { backgroundColor: theme.colors.surface, flex: 1 },
    scrollView: { flexGrow: 1 },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    searchRow: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 8,
      height: 44,
      marginBottom: 12,
      paddingHorizontal: 12,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      opacity: 0.6,
    },
    smsCodeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingHorizontal: 10,
    },
    smsCodeInput: {
      backgroundColor: theme.colors.surfaceContainer,
      borderColor: theme.colors.border,
      borderRadius: 10,
      borderWidth: 1,
      color: theme.colors.textPrimary,
      fontFamily: 'League Spartan',
      fontSize: 24,
      height: 50,
      textAlign: 'center',
      width: 40,
    },
    socialAuthContainer: {
      flexDirection: 'row',
      gap: 16,
      justifyContent: 'center',
      marginVertical: 12,
    },
    subtitle: {
      color: theme.dark ? theme.colors.primary : theme.colors.textPrimary,
      marginBottom: 20,
      textAlign: 'center',
    },
    suggestPasswordButton: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    },
    text: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      marginBottom: 20,
    },
    titleText: {
      color: theme.colors.textPrimary,
    },
    titleView: {
      alignItems: 'center',
      margin: 10,
      marginTop: 40,
    },
    loginTypeContainer: {
  flexDirection: 'row',
  backgroundColor: theme.colors.surfaceContainer,
  borderRadius: 12,
  padding: 4,
  marginBottom: 20,
},

loginTypeButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: 'center',
},

loginTypeButtonActive: {
  backgroundColor: theme.colors.primary,
},

loginTypeText: {
  color: theme.colors.textSecondary,
  fontWeight: '600',
},

loginTypeTextActive: {
  color: theme.colors.white,
},
  });
};

export default useStyles;
