import { StyleSheet } from 'react-native';
import { ThemeType } from '../../../theme';

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    activeDot: {
      backgroundColor: theme.colors.googleRed,
      borderColor: theme.colors.surfaceContainer,
      borderRadius: 5,
      borderWidth: 2,
      height: 10,
      position: 'absolute',
      right: 10,
      top: 10,
      width: 10,
    },
    applyButton: {
      alignItems: 'center',
      borderRadius: 16,
      marginTop: 20,
      paddingVertical: 16,
    },
    applyButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    checkBadge: { position: 'absolute', right: 4, top: 4 },
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      fontFamily: 'League Spartan',
      height: '100%',
      padding: 20,
    },
    eqCard: {
      alignItems: 'center',
      aspectRatio: 1,
      borderRadius: 15,
      borderWidth: 2,
      justifyContent: 'center',
      marginBottom: 5,
      padding: 8,
      width: '30%',
    },
    eqImage: { height: '80%', width: '80%' },
    equipmentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'flex-start',
    },
    filterCircle: {
      alignItems: 'center',
      borderRadius: 22,
      elevation: 3,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    filterTypeContainer: { flexDirection: 'row', gap: 10 },
    headerContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    modalContent: {
      backgroundColor: theme.colors.surfaceContainer,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
    },
    modalContentDefault: {
      height: 'auto',
      minHeight: 300,
    },
    modalContentEquipped: {
      height: '85%',
    },
    modalHeaderTitle: { fontSize: 18, fontWeight: '800' },
    modalOverlay: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalTopBar: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    resetRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
    resetText: { fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginVertical: 16 },
    typeButton: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1.5,
      flex: 1,
      paddingVertical: 12,
    },
    typeButtonText: { fontSize: 12, fontWeight: '700' },
  });
};

export default useStyles;
