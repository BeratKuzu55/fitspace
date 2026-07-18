import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faTimes,
  faUndoAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image'; // Hızlı ve bellek dostu resim kütüphanesi
import { useTheme } from '../../../theme';
import useStyles from './styles.ts';

// 1. Yerel resim haritasını ve placeholder'ı import ediyoruz
import { equipmentImages, PLACEHOLDER_IMAGE } from '../../../assets/imageMaps';

type FilterType = 'all' | 'no_equipment' | 'equipped';

interface Equipment {
  id: number;
  name: string;
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  availableEquipments: Equipment[];
  selectedIds: number[];
  toggleEquipment: (id: number) => void;
  onReset: () => void;
}

const FilterModal = ({
  isVisible,
  onClose,
  filterType,
  setFilterType,
  availableEquipments,
  selectedIds,
  toggleEquipment,
  onReset,
}: FilterModalProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            filterType === 'equipped'
              ? styles.modalContentEquipped
              : styles.modalContentDefault,
          ]}
        >
          <View style={styles.modalTopBar}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesomeIcon
                icon={faTimes as IconProp}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.modalHeaderTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              {t('quickStart.filters.title')}
            </Text>

            <TouchableOpacity onPress={onReset} style={styles.resetRow}>
              <FontAwesomeIcon
                icon={faUndoAlt as IconProp}
                size={14}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.resetText, { color: theme.colors.primary }]}
              >
                {t('quickStart.filters.reset')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              {t('quickStart.filters.type')}
            </Text>

            <View style={styles.filterTypeContainer}>
              {(['all', 'no_equipment', 'equipped'] as FilterType[]).map(
                type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilterType(type)}
                    style={[
                      styles.typeButton,
                      {
                        borderColor: theme.colors.primaryVariant,
                        backgroundColor: theme.colors.surfaceVariant,
                      },
                      filterType === type && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: theme.colors.textSecondary },
                        filterType === type && { color: theme.colors.onPrimary },
                      ]}
                    >
                      {t(`quickStart.filters.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>

            {filterType === 'equipped' && (
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {t('quickStart.filters.selectEquipment')}
                </Text>
                <View style={styles.equipmentGrid}>
                  {availableEquipments.map(eq => {
                    const isSelected = selectedIds.includes(eq.id);
                    return (
                      <TouchableOpacity
                        key={eq.id}
                        onPress={() => toggleEquipment(eq.id)}
                        style={[
                          styles.eqCard,
                          {
                            backgroundColor: theme.colors.surfaceContainer,
                            borderColor: theme.colors.border,
                          },
                          isSelected && {
                            borderColor: theme.colors.primary,
                            backgroundColor: theme.colors.primaryVariant + '20',
                          },
                        ]}
                      >
                        {/* 2. KRİTİK DEĞİŞİKLİK: FastImage ve Yerel Map Kullanımı */}
                        <FastImage
                          style={styles.eqImage}
                          source={equipmentImages[eq.id] || PLACEHOLDER_IMAGE}
                          resizeMode={FastImage.resizeMode.contain}
                        />

                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <FontAwesomeIcon
                              icon={faCheckCircle as IconProp}
                              size={16}
                              color={theme.colors.primary}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.applyButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.applyButtonText}>
              {t('quickStart.filters.apply')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default memo(FilterModal);
