import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COUNTRIES } from '../src/utils/enums/enums';
import { DialCodePickerProps } from './types';

const DialCodePicker: React.FC<DialCodePickerProps> = ({
  value,
  onChange,
  theme,
  styles,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [query]);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.dialButton,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.dialText}>
          {value}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.dark ? theme.colors.textSecondary : theme.colors.surfaceContainer }]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
            >
              {t('auth:register.countryPicker.title')}
            </Text>
            <View style={styles.searchRow}>
              <FontAwesomeIcon
                icon={faSearch as IconProp}
                size={16}
                color={theme.colors.textPrimary}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('auth:register.countryPicker.searchPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    onChange(item.dialCode);
                    setVisible(false);
                  }}
                >
                  <Text style={{ color: theme.colors.textPrimary }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: theme.colors.textPrimary }}>
                    {item.dialCode}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.cancelBtn}
            >
              <Text>{t('auth:register.countryPicker.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DialCodePicker;
