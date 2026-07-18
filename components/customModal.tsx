import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';

const CustomModal = ({
  visible,
  setVisible,
  title,
  text,
  children,
  showCloseButton = true,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title?: string;
  text?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {title && <Text style={styles.modalTitle}>{title}</Text>}
          {children ? (
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              {children}
            </ScrollView>
          ) : text ? (
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalText}>{text}</Text>
            </ScrollView>
          ) : null}
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>
                {t('exerciseLibrary.closeButton')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
