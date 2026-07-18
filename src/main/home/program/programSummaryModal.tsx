import FastImage from '@d11/react-native-fast-image';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClock, faFire, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { memo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { PLACEHOLDER_IMAGE, programImages } from '../../../assets/imageMaps';
import { levelBg, levelTR } from '../../../services/program';
import { WeeklyIcons } from './weeklyIcons';

const ProgramSummaryModal = ({
  visible,
  selected,
  onClose,
  onStart,
  starting,
  isEnglish,
  theme,
  styles,
  t,
}: any) => {
  if (!selected) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            { borderColor: levelBg(theme, selected.level) },
          ]}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={{ backgroundColor: theme.colors.surface }}
          >
            <View style={styles.modalHeaderContainer}>
              <FastImage
                source={programImages[selected.id] || PLACEHOLDER_IMAGE}
                style={styles.modalImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.modalTitleOverlay}>
                <Text style={styles.modalOverlayTitle} numberOfLines={2}>
                  {isEnglish ? selected.name_en : selected.name}
                </Text>
              </View>
            </View>

            <View style={styles.modalBodyContent}>
              <View style={styles.dividerContainer}>
                <View style={styles.line} />
              </View>

              <Text style={styles.modalDesc}>
                {isEnglish ? selected.description_en : selected.description}
              </Text>

              <WeeklyIcons theme={theme} program={selected} styles={styles} />

              <View style={styles.modalStatsRow}>
                <View style={styles.newCardStatItem}>
                  <FontAwesomeIcon
                    icon={faFire as IconProp}
                    size={16}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.newCardModalStatText}>
                    {levelTR(selected.level)}
                  </Text>
                </View>
                <View style={styles.newCardStatItem}>
                  <FontAwesomeIcon
                    icon={faClock as IconProp}
                    size={16}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.newCardModalStatText}>
                    {selected.duration} {isEnglish ? 'Weeks' : 'Hafta'}
                  </Text>
                </View>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.line} />
              </View>

              <View style={styles.modalActions}>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <FontAwesomeIcon
                    icon={faXmark as IconProp}
                    size={20}
                    color={theme.colors.onPrimary}
                  />
                </Pressable>
                <Pressable
                  onPress={onStart}
                  disabled={starting}
                  style={[styles.primaryBtnWide, starting && styles.opacity]}
                >
                  <Text style={styles.primaryText}>
                    {starting
                      ? t('programFront.starting')
                      : t('programFront.start')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default memo(ProgramSummaryModal);
