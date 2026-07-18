import React from 'react';
import { Modal, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AlertProps } from './types';

const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  showCancel = true,
  type = 'gray700',
  style,
  children,
  theme,
  styles,
  t,
}) => {
  const getConfirmButtonStyle = (): ViewStyle => {
    switch (type) {
      case 'googleRed':
        return { backgroundColor: theme.colors.googleRed };
      case 'green':
        return { backgroundColor: theme.colors.green };
      case 'purple600':
        return { backgroundColor: theme.colors.primary };
      default:
        return { backgroundColor: theme.colors.textSecondary };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, style]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
          {children}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity style={styles.alertButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>
                  {cancelText || t('common.cancel')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.alertButton, getConfirmButtonStyle()]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText || t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Alert;
