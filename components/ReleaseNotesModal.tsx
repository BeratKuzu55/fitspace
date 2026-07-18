import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { RNModalProps } from './types';

const ReleaseNotesModal: React.FC<RNModalProps> = ({
  isVisible,
  onClose,
  data,
  title = 'Sürüm Geçmişi',
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.rnModalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.rnCloseButton}>
              <FontAwesomeIcon
                icon={faXmark as IconProp}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {data.map((item, index) => (
              <View key={index} style={styles.versionItem}>
                <View style={styles.versionHeader}>
                  <Text style={styles.versionNumber}>v{item.version}</Text>
                  <Text style={styles.versionDate}>{item.date}</Text>
                </View>
                {item.changes.map((change, i) => (
                  <Text key={i} style={styles.changeText}>
                    • {change}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ReleaseNotesModal;
