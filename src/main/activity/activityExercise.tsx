import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBackwardStep,
  faForwardStep,
  faListUl,
  faPause,
  faPlay,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { exerciseImages } from '../../assets/imageMaps';
import { useTheme } from '../../theme';
import ExerciseDetailCards from './exerciseDetailCards';
import useStyles from './styles';
import { Exercise, GroupedExercises } from './types';
import Loader from '../../../components/Loader';
import { useTranslation } from 'react-i18next';

interface ActivityExerciseProps {
  exercise: Exercise;
  currentSet: number;
  videoUrl: string | null;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  allExercises: Exercise[];
}

const ActivityExercise: React.FC<ActivityExerciseProps> = ({
  exercise,
  currentSet,
  videoUrl,
  onNext,
  onPrev,
  onExit,
  allExercises,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercise.duration);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Egzersiz tipini belirle: 
  // - duration > 0 ve repetitions = 0 → süre bazlı
  // - duration = 0 ve repetitions > 0 → tekrar bazlı
  // - duration > 0 ve repetitions > 0 → süre bazlı (duration öncelikli)
  const duration = Number(exercise.duration) || 0;
  const repetitions = Number(exercise.repetitions) || 0;
  const isRepetitionBased = repetitions > 0 && duration === 0;
  const totalReps = repetitions;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isVideoReady && !isPaused && !videoError) {
      timeout = setTimeout(() => {
        console.warn('Video yükleme zaman aşımı, görsele dönülüyor.');
        setIsVideoReady(true);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [isVideoReady, isPaused, videoError, exercise.id]);

  // Sayaç Mantığı - Sadece süre bazlı egzersizlerde otomatik sayaç çalışır
  useEffect(() => {
    // Tekrar bazlı egzersizlerde otomatik sayaç çalışmaz
    if (isRepetitionBased) return;

    if ((isVideoReady || videoError) && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isRepetitionBased) {
      // Süre bazlı egzersizlerde süre bittiğinde otomatik geçiş
      onNext();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVideoReady, videoError, isPaused, timeLeft, onNext, isRepetitionBased]);

  // Egzersiz değiştiğinde state'i sıfırla
  useEffect(() => {
    setTimeLeft(exercise.duration);
    setIsPaused(false);
    setIsVideoReady(false);
    setVideoError(false);

    // Eğer video URL'i yoksa doğrudan hazır kabul et
    if (!videoUrl) {
      setIsVideoReady(true);
    }
  }, [exercise.duration, exercise.id, exercise.repetitions, videoUrl]);

  const localImage = exerciseImages[exercise.id];

  const formattedTitle = exercise.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const groupedExercises = useMemo<GroupedExercises>(() => {
    const initial: GroupedExercises = { warmup: [], main: [], cool_down: [] };
    if (!allExercises) return initial;

    return allExercises.reduce((acc, ex) => {
      if (acc[ex.exercise_type]) {
        acc[ex.exercise_type].push(ex);
      }
      return acc;
    }, initial);
  }, [allExercises]);

  const groupedTitles: Record<string, string> = {
    warmup: t('activityModule.warmup'),
    main: t('activityModule.main'),
    cool_down: t('activityModule.cooldown'),
  };

  return (
    <View style={styles.fullScreen}>
      {(!isVideoReady || isPaused) && (
        <Image
          source={localImage}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      {!isPaused && (
        <Video
          source={{ uri: videoUrl || '' }}
          style={[StyleSheet.absoluteFill, { opacity: isVideoReady ? 1 : 0 }]}
          resizeMode="cover"
          repeat
          paused={isPaused}
          onReadyForDisplay={() => setIsVideoReady(true)}
        />
      )}

      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.backdrop },
        ]}
      />

      {/* ARAYÜZ KATMANI */}
      {!isVideoReady && !isPaused ? (
        <Loader />
      ) : (
        <View style={styles.uiLayer}>
          {/* HEADER BÖLÜMÜ */}
          {!isPaused ? (
            <View style={styles.exerciseHeader}>
              <TouchableOpacity onPress={onExit} style={styles.iconCircle}>
                <FontAwesomeIcon
                  icon={faXmark as IconProp}
                  color={theme.colors.white}
                  size={20}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{formattedTitle.length > 25 ? formattedTitle.slice(0, 25) + '...' : formattedTitle}</Text>
              <View >
                <Text style={styles.setText}>
                  SET {currentSet} / {exercise.setcount}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.exerciseHeader}>
              <TouchableOpacity
                onPress={() => setShowSummaryModal(true)}
                style={styles.summarizeBtn}
              >
                <FontAwesomeIcon
                  icon={faListUl as IconProp}
                  color={theme.colors.white}
                  size={16}
                />
                <Text style={styles.summarizeBtnText}>
                  {t('activityModule.summary.button')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{formattedTitle}</Text>
            </View>
          )}

          {/* ORTA BÖLÜM: SAYAÇ */}
          <View style={styles.timerContainer}>
            {isRepetitionBased ? (
              <>
                <Text style={styles.timerText}>{totalReps}x</Text>
                <Text style={styles.timerSubText}>
                  {t('activityModule.session.progressModal.repetition') || 'Repetitions'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.timerText}>{timeLeft}</Text>
                <Text style={styles.timerSubText}>
                  {t('activityModule.session.restScreen.second')}
                </Text>
              </>
            )}
          </View>

          {/* FOOTER BÖLÜMÜ */}
          <View style={styles.footer}>
            {!isPaused ? (
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
                  <FontAwesomeIcon
                    icon={faBackwardStep as IconProp}
                    color="white"
                    size={24}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsPaused(true)}
                  style={styles.playPauseBtn}
                >
                  <FontAwesomeIcon
                    icon={faPause as IconProp}
                    color="white"
                    size={30}
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={onNext}
                  style={styles.navBtn}
                >
                  <FontAwesomeIcon
                    icon={faForwardStep as IconProp}
                    color="white"
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsPaused(false)}
                style={styles.resumeBtn}
              >
                <FontAwesomeIcon
                  icon={faPlay as IconProp}
                  color="white"
                  size={24}
                />
                <Text style={styles.resumeBtnText}>DEVAM ET</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* ÖZET MODALI */}
      <Modal
        visible={showSummaryModal}
        animationType="fade"
        transparent={false}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {t('activityModule.summary.button')}
          </Text>
          <TouchableOpacity onPress={() => setShowSummaryModal(false)}>
            <FontAwesomeIcon
              icon={faXmark as IconProp}
              color={theme.colors.textPrimary}
              size={24}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.exerciseModalContainer}>
          {/* MODAL HEADER */}

          {/* GRUPLANMIŞ LİSTE */}
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
          >
            {(['warmup', 'main', 'cool_down'] as const).map(type => {
              const group = groupedExercises[type];
              if (!group || !group.length) return null;

              return (
                <View key={type} style={styles.group}>
                  {/* Grup Başlığı: Isınma, Ana Bölüm vb. */}
                  <Text style={styles.groupTitle}>{groupedTitles[type]}</Text>

                  {group.map((ex: Exercise, index: number) => {
                    // Başlık Formatlama
                    const cardTitle = ex.name
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                    return (
                      <ExerciseDetailCards
                        key={ex.id}
                        id={ex.id}
                        stepNumber={index + 1}
                        title={cardTitle}
                        image={exerciseImages[ex.id]}
                        time={{
                          duration: Number(ex.duration) || 0,
                          setcount: Number(ex.setcount) || 0,
                          repetitions: Number(ex.repetitions) || 0,
                        }}
                        steps={ex.steps || {}}
                        steps_en={ex.steps_en || {}}
                      />
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ActivityExercise;
