import { StyleSheet } from 'react-native';
import { ThemeType } from '../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    activityButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    ageDisplay: {
      color: theme.colors.primary,
      fontSize: 48,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 25,
      marginTop: 20,
      padding: 15,
    },
    buttonContainer: {
      alignItems: 'center',
      gap: 15,
    },
    buttonText: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    checkboxContainer: {
      marginVertical: 20,
    },
    checkboxLabel: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginLeft: 8,
    },
    checkboxRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 10,
    },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    continueButton: {
      alignSelf: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 25,
      marginTop: 30,
      paddingHorizontal: 25,
      paddingVertical: 12,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    continueButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    experienceButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    genderButton: {
      alignItems: 'center',
      borderRadius: 10,
      marginVertical: 10,
      padding: 15,
      width: '80%',
    },
    genderCircle: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 50,
      height: 100,
      justifyContent: 'center',
      marginBottom: 5,
      width: 100,
    },
    genderLabel: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    genderText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },
    heightBar: {
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
      width: 6,
    },
    heightUnit: {
      color: theme.colors.textSecondary,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 6,
      marginLeft: 5,
    },
    heightValue: {
      color: theme.colors.primary,
      fontSize: 48,
      fontWeight: 'bold',
    },
    heightValueContainer: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    pickerContainer: {
      alignItems: 'center',
      height: 200,
      justifyContent: 'center',
      marginVertical: 20,
    },
    radioGroup: {
      backgroundColor: theme.colors.backgroundOverlay,
      borderRadius: 32,
      marginBottom: 30,
      padding: 16,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 32,
    },
    segmentedGroup: {
      backgroundColor: theme.colors.backgroundOverlay,
      borderRadius: 32,
      marginBottom: 30,
      marginTop: 20,
      padding: 10,
    },
    selectedButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
    },
    selectedGenderCircle: {
      elevation: 6,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.7,
      shadowRadius: 10,
    },
    selectedWheel: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    slider: {
      alignSelf: 'center',
      marginVertical: 20,
      width: 250,
    },
    subtitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      marginBottom: 20,
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    title: {
      alignSelf: 'center',
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    visualRow: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
      marginTop: 20,
    },
    wheelPicker: {
      height: 180,
      width: '80%',
    },
  });
};

export default useStyles;
