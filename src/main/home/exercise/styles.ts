import { StyleSheet } from "react-native";
import { overlays, primitives } from "../../../../styles/colors";
import { ThemeType } from "../../../theme";

const useStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      paddingTop: 10,
    },
    cardContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.textPrimary,
      borderRadius: 16,
      borderWidth: 1,
      elevation: 2,
      flexDirection: 'row',
      height: 140,
      marginVertical: 12,
      padding: 16,
    },
    searchSection: {
      marginBottom: 10,
      paddingHorizontal: 16,
    },
    searchContainer: {
      alignItems: "center",
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 14,
      elevation: 3,
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 6,
      shadowColor: primitives.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    searchIcon: { marginRight: 6 },
    searchInput: {
      color: theme.colors.textPrimary,
      flex: 1,
      fontSize: 16,
    },
    searchButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      padding: 10,
    },
    searchButtonDisabled: {
      backgroundColor: theme.colors.border,
    },

    /** 📋 Liste alanı */
    listContent: {
      paddingBottom: 40,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 14,
      display:"flex",
      elevation: 3,
      flexDirection: "row",
      marginBottom: 14,
      overflow: "hidden",
      shadowColor: primitives.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    cardImage: {
      height: 160,
      width: "100%",
    },
    cardImagePlaceholder: {
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      height: 160,
      justifyContent: "center",
      width: "100%",
    },
    noImageText: {
      color: theme.colors.textSecondary,
    },
    cardBody: {
      padding: 12,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
    cardMeta: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },

    /** 🌀 Boş sonuç */



  
      imageContainer: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 10,
        height: 140,
        overflow: "hidden",
        width: 100,
      },
      image: {
        height: "100%",
        width: "100%",
      },
      imagePlaceholder: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      },
  
      infoContainer: {
        flex: 1,
        marginLeft: 12,
      },
  
      infoRow: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 4,
      },
      infoText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginLeft: 6,
      },
      videoButton: {
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        width: 40,
      },
      modalOverlay: {
        alignItems: "center",
        backgroundColor: theme.overlays.backdrop,
        flex: 1,
        justifyContent: "center",
      },
      
      video: {
        backgroundColor: primitives.black,
        borderRadius: 10,
        height: 300,
        width: "100%",
      },
      modalCloseButton: {
        alignSelf: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
      },
      modalCloseText: {
        color: theme.colors.onPrimary,
        fontWeight: "500",
      },
      loadingContainer: { alignItems: "center", flex: 1, justifyContent: "center" },
      emptyContainer: { alignItems: "center", paddingVertical: 40 },
      emptyText: { color: theme.colors.textSecondary },

    /** 📄 Pagination */
    paginationContainer: {
      alignItems: "center",
      flexDirection: "row",
      gap: 4,
      justifyContent: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    paginationNavButton: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.textPrimary,
      borderRadius: 8,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    paginationNavButtonDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
      opacity: 0.5,
    },
    paginationNumbersContainer: {
      alignItems: "center",
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 4,
    },
    paginationNumberButton: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.textPrimary,
      borderRadius: 8,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      minWidth: 36,
      paddingHorizontal: 12,
    },
    paginationNumberButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    paginationNumberText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    paginationNumberTextActive: {
      color: theme.colors.onPrimary,
    },
    paginationEllipsis: {
      alignItems: "center",
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    paginationEllipsisText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    centerBlock: {
      alignItems: 'center',
      flex: 1,
      height: '100%',
      justifyContent: 'center',
    },
    closeButton: {
      borderRadius: 25,
      padding: 10,
    },
    descriptionText: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '500',
      lineHeight: 26,
      paddingVertical: 8,
      textAlign: 'left',
    },farSideBlock: {
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
    },
    iconText: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    modalBackdrop: {
      alignItems: 'center',
      backgroundColor: overlays.backdrop.light,
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 24,
      elevation: 15,
      maxHeight: '85%',
      minHeight: 400,
      overflow: 'hidden',
      padding: 0,
      shadowColor: theme.colors.onSurface,
      shadowOffset: {
        width: 0,
        height: 15,
      },
      shadowOpacity: 0.3,
      shadowRadius: 25,
      width: '100%',
    },modalContent: {
      backgroundColor: theme.colors.surface,
      flex: 1,
      minHeight: 120,
      padding: 24,
      paddingBottom: 30,
      paddingTop: 20,
    },
    modalHeader: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 24,
      paddingBottom: 16,
    },
    modalIcon: {
      marginRight: 12,
    },
    modalIconContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
    },
    modalTitle: {
      color: theme.colors.white,
      flex: 1,
      fontSize: 22,
      fontWeight: '800',
      textShadowColor: theme.overlays.surfaceOverlay,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    noDescriptionText: {
      color: theme.colors.textSecondary,
      fontSize: 17,
      fontStyle: 'italic',
      fontWeight: '500',
      paddingVertical: 20,
      textAlign: 'center',
    },
    setCountIconWrapper: {
      alignItems: 'center',
      height: 36,
      justifyContent: 'center',
      position: 'relative',
      width: 36,
    },
    setCountImage: {
      height: 80,
      width: 80,
    },
    setCountOverlay: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
      position: 'absolute',
    },
    setCountText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      marginLeft: 32,
      marginTop: 40,
    },
    sideBlock: {
      alignItems: 'flex-start',
      height: '100%',
      justifyContent: 'center',
      width: '25%',
    },
    stepNumberContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      height: 24,
      justifyContent: 'center',
      width: 24,
    },
    stepNumberText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    summaryImage: {
      borderRadius: 16,
      height: 124,
      width: 124,
    },    timeText: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',marginBottom: 15,
      paddingTop: 8,
      textAlign: 'left',
    },
    videoModalContainer: {
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 24,
      elevation: 3,
      maxHeight: '90%',
      minHeight: 550,
      overflow: 'hidden',
      padding: 0,
      shadowColor: theme.colors.onSurface,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      width: '85%',
    },
    videoModalTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
    },
    videoModalTopArea: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: '5%',
    },
  });
};

export default useStyles;
