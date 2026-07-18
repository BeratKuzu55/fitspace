import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'; // Yeni ikonlar
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { memo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeType } from '../../../theme';

export const FilterDropdown = memo(function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  displayFormat,
  theme,
  styles,
  t,
}: {
  label: string;
  value: string | number;
  options: (string | number)[];
  onSelect: (val: string | number) => void;
  displayFormat: (val: string | number) => string;
  theme: ThemeType;
  styles: any;
  t: ThemeType;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.filterButtonText} numberOfLines={1}>
          {value === 'all' ? label : displayFormat(value)}
        </Text>
        <FontAwesomeIcon
          icon={faChevronDown as IconProp}
          size={12}
          color={theme.colors.textPrimary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label}</Text>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  value === 'all' && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect('all');
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === 'all' && styles.dropdownItemTextActive,
                  ]}
                >
                  {t('common.all') || 'Hepsi'}
                </Text>
                {value === 'all' && (
                  <FontAwesomeIcon
                    icon={faCheck as IconProp}
                    size={14}
                    color={theme.colors.onPrimary}
                  />
                )}
              </TouchableOpacity>

              {/* Diğer Seçenekler */}
              {options.map((opt, idx) => {
                const isActive = value === opt;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      onSelect(opt);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isActive && styles.dropdownItemTextActive,
                      ]}
                    >
                      {displayFormat(opt)}
                    </Text>
                    {isActive && (
                      <FontAwesomeIcon
                        icon={faCheck as IconProp}
                        size={14}
                        color={theme.colors.onPrimary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
});
