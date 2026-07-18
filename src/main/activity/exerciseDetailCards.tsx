import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faChevronDown,
  faChevronUp,
  faCirclePlay,
  faInfoCircle,
  faLayerGroup,
  faRepeat,
  faSpinner,
  faStopwatch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FastImage from '@d11/react-native-fast-image';
import { Modal, Pressable, Text, View } from 'react-native';
import Video from 'react-native-video';
import { storage } from '../../../firebaseConfig';
import { formatDurationOrReps } from '../../services/activity';
import { useTheme } from '../../theme';
import useStyles from './styles';

interface ExerciseDetailCardProps {
  image: any;
  title: string;
  time: {
    duration: number;
    setcount: number;
    repetitions: number;
  };
  stepNumber: number;
  id: number;
  steps: Record<string, string>;
  steps_en: Record<string, string>;
}

const ExerciseDetailCard: React.FC<ExerciseDetailCardProps> = ({
  image,
  title,
  time = { duration: 0, setcount: 0, repetitions: 0 },
  stepNumber,
  id,
  steps,
  steps_en,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // State Yönetimi
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Görsel ve Metin Hazırlığı
  const timeText = formatDurationOrReps(
    time?.duration || 0,
    time?.setcount || 0,
    time?.repetitions || 0,
  );
  const activeSteps = isEnglish ? steps_en : steps;

  // Video Çekme Fonksiyonu
  const handlePlayVideo = async () => {
    if (videoUrl) {
      setIsVideoVisible(true);
      return;
    }
    setLoadingVideo(true);
    try {
      const videoRef = ref(storage, `exercise-videos/${id}.mp4`);
      const url = await getDownloadURL(videoRef);
      setVideoUrl(url);
      setIsVideoVisible(true);
    } catch (error) {
      console.error('Video yüklenemedi', error);
      setVideoUrl(null);
      setIsVideoVisible(true);
    } finally {
      setLoadingVideo(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. ÜST KISIM: Akordeon Başlığı (Her Zaman Görünür) */}
      <Pressable
        style={({ pressed }) => [
          styles.cardHeader,
          isExpanded && styles.cardHeaderActive,
          pressed && styles.pressedState,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{stepNumber}</Text>
          </View>
          <FastImage
            source={image}
            style={styles.thumbnail}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.exerciseTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.exerciseSubtitle}>{timeText}</Text>
          </View>
        </View>
        <FontAwesomeIcon
          icon={(isExpanded ? faChevronUp : faChevronDown) as IconProp}
          size={14}
          color={theme.colors.textPrimary}
        />
      </Pressable>

      {/* 2. ALT KISIM: Akordeon İçeriği (Genişlediğinde Görünür) */}
      {isExpanded && (
        <View style={styles.cardContent}>
          {/* Hızlı İstatistikler */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <FontAwesomeIcon
                icon={faLayerGroup as IconProp}
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.statText}>{time.setcount} Set</Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesomeIcon
                icon={faRepeat as IconProp}
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.statText}>
                {time.repetitions || '-'} Reps
              </Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesomeIcon
                icon={faStopwatch as IconProp}
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.statText}>{time.duration}s</Text>
            </View>
          </View>

          {/* Video İzleme Butonu (Premium Görünüm) */}
          <Pressable
            style={({ pressed }) => [
              styles.videoButton,
              pressed && styles.pressedState,
              loadingVideo && { backgroundColor: theme.colors.primaryVariant },
            ]}
            onPress={handlePlayVideo}
          >
            <FontAwesomeIcon
              icon={(loadingVideo ? faSpinner : faCirclePlay) as IconProp}
              size={18}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.videoButtonText}>
              {loadingVideo
                ? t('activityModule.summary.video')
                : t('activityModule.summary.video')}
            </Text>
          </Pressable>

          {/* Adımlar Listesi */}
          <View style={styles.stepsContainer}>
            <View style={styles.sectionHeader}>
              <FontAwesomeIcon
                icon={faInfoCircle as IconProp}
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>
                {t('activityModule.summary.instructions')}
              </Text>
            </View>
            {Object.entries(activeSteps).map(([key, stepText], idx) =>
              stepText ? (
                <View key={key} style={styles.stepRow}>
                  <Text style={styles.stepIndex}>{idx + 1}.</Text>
                  <Text style={styles.stepDescription}>{stepText}</Text>
                </View>
              ) : null,
            )}
          </View>
        </View>
      )}

      {/* Video Modalı (Aynı kaldı, sadece UI iyileştirildi) */}
      <Modal
        visible={isVideoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVideoVisible(false)}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                onPress={() => setIsVideoVisible(false)}
                style={styles.modalCloseBtn}
              >
                <FontAwesomeIcon
                  icon={faXmark as IconProp}
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </Pressable>
            </View>
            <View style={styles.videoWrapper}>
              {videoUrl ? (
                <Video
                  source={{ uri: videoUrl }}
                  style={styles.videoPlayer}
                  resizeMode="contain"
                  repeat
                  playInBackground={false}
                />
              ) : (
                <Text style={styles.videoErrorText}>Video Not Found</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default memo(ExerciseDetailCard);
