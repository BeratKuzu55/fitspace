import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCirclePlay,
  faDumbbell,
  faQuestionCircle,
  faSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { storage } from '../../../../firebaseConfig';
import i18n from '../../../locales/i18n';
import { useTheme } from '../../../theme';
import useStyles from './styles';

interface Exercise {
  id: number;
  name: string;
  duration: number;
  setcount: number;
  repetitions: number;
  exercise_type: string;
  video_url: string;
}

interface ExerciseLibraryCardProps {
  image: any;
  title: string;
  exercises: Exercise[];
  video_url?: string;
  stepNumber: number;
  id: number;
  difficulty: string;
  steps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
  steps_en: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
}

const ExerciseLibraryCard: React.FC<ExerciseLibraryCardProps> = ({
  image,
  title,
  stepNumber,
  id,
  difficulty,
  steps,
  steps_en,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const currentLanguage = i18n.language || 'tr';
  const isEnglish = currentLanguage === 'en';

  const fetchVideo = async () => {
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

  const renderDifficultyBars = (difficulty: string) => {
    const level = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const total = 3; // toplam çubuk sayısı
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: total }).map((_, idx) => (
          <FontAwesomeIcon
            key={idx}
            icon={faSquare as IconProp}
            size={12}
            color={idx < level ? theme.colors.primary : theme.colors.border}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.sideBlock}>
        <Text style={styles.title}>{title}</Text>
        {renderDifficultyBars(difficulty)}
      </View>
      <View style={styles.centerBlock}>
        <Image
          source={
            image
              ? image
              : require('../../../assets/card_images/seninGozunden.png')
          }
          style={styles.summaryImage}
        />
      </View>
      <View style={styles.farSideBlock}>
        <TouchableOpacity onPress={() => setIsDescriptionVisible(true)}>
          <FontAwesomeIcon
            icon={faQuestionCircle as IconProp}
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchVideo}>
          <FontAwesomeIcon
            icon={faCirclePlay as IconProp}
            size={22}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
      </View>

      {/* Açıklama Modal */}
      <Modal
        visible={isDescriptionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDescriptionVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              >
                <FontAwesomeIcon
                  icon={faDumbbell as IconProp}
                  size={20}
                  color={theme.colors.white}
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDescriptionVisible(false)}
              >
                <FontAwesomeIcon
                  icon={faXmark as IconProp}
                  size={20}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: theme.colors.primary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {t('exerciseDetailCard.exerciseDescription')}
                </Text>
              </View>
              {Object.entries(isEnglish ? steps_en : steps).map(
                ([key, stepText], stepIndex) =>
                  stepText ? (
                    <Text key={key} style={styles.descriptionText}>
                      {stepIndex + 1}. {stepText}
                    </Text>
                  ) : null,
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={isVideoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVideoVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.videoModalContainer}>
            <View style={styles.videoModalTopArea}>
              <Text
                style={styles.videoModalTitle}
              >
                {title}
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { alignSelf: 'center', marginVertical: 5 },
                ]}
                onPress={() => setIsVideoVisible(false)}
              >
                <FontAwesomeIcon
                  icon={faXmark as IconProp}
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {loadingVideo ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <>
                {videoUrl ? (
                  <Video
                    source={{ uri: videoUrl }}
                    style={{
                      width: '100%',
                      height: 500,
                      borderWidth: 1,
                      backgroundColor: theme.colors.border,
                    }}
                    resizeMode="contain"
                    repeat={true} // döngüde oynat
                    paused={false} // direkt başlat
                  />
                ) : (
                  <Text style={{ textAlign: 'center', marginVertical: 20 }}>
                    Video bulunamadı
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExerciseLibraryCard;
