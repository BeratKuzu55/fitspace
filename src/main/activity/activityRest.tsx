import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../../../firebaseConfig';
import { exerciseImages, PLACEHOLDER_IMAGE } from '../../assets/imageMaps';
import { useTheme } from '../../theme';
import useStyles from './styles';
import { Exercise } from './types';

interface ActivityRestProps {
  nextExercise: Exercise | undefined;
  isNextSet: boolean;
  onRestEnd: (videoUrl: string | null) => void;
  onSkip: (videoUrl: string | null) => void;
}

const ActivityRest: React.FC<ActivityRestProps> = ({
  nextExercise,
  isNextSet,
  onRestEnd,
  onSkip,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  // --- STATE ---
  const restDuration = nextExercise?.rest_duration || 20;
  const [timeLeft, setTimeLeft] = useState(restDuration);
  const [nextVideoUrl, setNextVideoUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dinlenme süresini egzersiz değiştiğinde güncelle
  useEffect(() => {
    const restDur = nextExercise?.rest_duration || 20;
    setTimeLeft(restDur);
  }, [nextExercise?.id, nextExercise?.rest_duration]);

  // 1. PRE-FETCHING: Dinlenme başlar başlamaz videoyu indir (sadece yeni egzersiz varsa)
  useEffect(() => {
    if (!nextExercise || isNextSet) return; // Aynı egzersizin yeni seti ise video zaten var

    const fetchNextVideo = async () => {
      try {
        const videoRef = ref(storage, `exercise-videos/${nextExercise.id}.mp4`);
        const url = await getDownloadURL(videoRef);
        setNextVideoUrl(url);
      } catch (error) {
        console.error('Video ön yükleme başarısız:', error);
      }
    };

    fetchNextVideo();
  }, [nextExercise?.id, isNextSet, nextExercise]);

  // 2. TİMER MANTIĞI
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      onRestEnd(nextVideoUrl);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, nextVideoUrl, onRestEnd]);

  // 3. SÜRE EKLEME
  const handleAddTime = () => {
    setTimeLeft(prev => prev + 15);
  };

  if (!nextExercise) return null;

  const localImage = exerciseImages[nextExercise.id];

  const formattedTitle = nextExercise.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <View style={styles.fullScreen}>
      {/* ARKA PLAN: Sonraki Egzersizin Görseli */}
      <View
        style={[StyleSheet.absoluteFill, styles.restBackgroundImageContainer]}
      >
        <FastImage
          source={localImage || PLACEHOLDER_IMAGE}
          style={styles.restBackgroundImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.backdrop },
        ]}
      />

      <View style={styles.uiLayer}>
        {/* ÜST BİLGİ */}
        <View style={styles.restHeader}>
          <Text style={styles.restTitle}>
            {t('activityModule.session.progressModal.rest')}
          </Text>
          <View style={styles.nextInfoBadge}>
            <Text style={styles.nextInfoText}>
              {isNextSet
                ? t('activityModule.session.restScreen.nextSet')
                : t('activityModule.session.restScreen.nextExercise')}
              {': '}
              {formattedTitle}
            </Text>
          </View>
        </View>

        {/* MERKEZİ SAYAÇ */}
        <View style={styles.timerContainer}>
          <Text style={styles.restTimerText}>{timeLeft}</Text>
          <Text style={styles.restTimerSubText}>
            {t('activityModule.session.restScreen.second')}
          </Text>
        </View>

        {/* FOOTER KONTROLLERİ */}
        <View style={styles.restFooter}>
          <TouchableOpacity onPress={handleAddTime} style={styles.addTimeBtn}>
            <FontAwesomeIcon
              icon={faPlus as IconProp}
              color={theme.colors.white}
              size={18}
            />
            <Text style={styles.restBtnText}>
              15 {t('activityModule.session.restScreen.second')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSkip(nextVideoUrl)}
            style={styles.skipRestBtn}
          >
            <FontAwesomeIcon
              icon={faPlay as IconProp}
              color={theme.colors.white}
              size={18}
            />
            <Text style={styles.restBtnText}>
              {t('activityModule.session.restScreen.continueButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ActivityRest;
