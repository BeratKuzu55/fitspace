import FastImage from '@d11/react-native-fast-image';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClock, faDumbbell, faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoundedButton from '../../../components/RoundedButton';
import { exerciseImages } from '../../assets/imageMaps';
import { useTheme } from '../../theme';
import ExerciseDetailCards from './exerciseDetailCards';
import useStyles from './styles';
import {
  Exercise,
  ExerciseType,
  GroupedExercises,
  WorkoutDetails,
} from './types';

const BUTTON_HEIGHT = 56;

interface ActivitySummaryProps {
  data: WorkoutDetails;
  onStart: () => void;
  isStarting: boolean;
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  data,
  onStart,
  isStarting,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // 1. Egzersizleri Tiplerine Göre Gruplandırma
  const groupedExercises = useMemo<GroupedExercises>(() => {
    const initial: GroupedExercises = { warmup: [], main: [], cool_down: [] };
    if (!data.exercises) return initial;

    return data.exercises.reduce((acc, ex) => {
      if (acc[ex.exercise_type]) {
        acc[ex.exercise_type].push(ex);
      }
      return acc;
    }, initial);
  }, [data.exercises]);

  const groupedTitles: Record<ExerciseType, string> = {
    warmup: t('activityModule.warmup'),
    main: t('activityModule.main'),
    cool_down: t('activityModule.cooldown'),
  };

  const formatGeneralDuration = (duration: number = 0) => {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = (level?: string) => {
    if (!level) return '';
    const labels: Record<string, string> = {
      beginner: t('activityModule.difficulty.beginner'),
      intermediate: t('activityModule.difficulty.intermediate'),
      advanced: t('activityModule.difficulty.advanced'),
    };
    return labels[level] || level;
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BUTTON_HEIGHT + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bölümü */}
        <View style={styles.header}>
          <View style={styles.headerContainer}>
            <FastImage
              source={require('../../assets/images/workout_featured.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <Text style={styles.headerTitle}>
              {isEnglish ? data.name_en : data.name}
            </Text>
          </View>

          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <FontAwesomeIcon
                icon={faClock as IconProp}
                size={24}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.metaText}>
                {formatGeneralDuration(data.time)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <FontAwesomeIcon
                icon={faDumbbell as IconProp}
                size={24}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.metaText}>
                {difficultyLabel(data.difficulty)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <FontAwesomeIcon
                icon={faFire as IconProp}
                size={24}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.metaText}>{data.calories} Kcal</Text>
            </View>
          </View>
        </View>

        {/* Egzersiz Grupları Render */}
        {(['warmup', 'main', 'cool_down'] as const).map(type => {
          const group = groupedExercises[type];
          if (!group.length) return null;

          return (
            <View key={type} style={styles.group}>
              <Text style={styles.groupTitle}>{groupedTitles[type]}</Text>
              {group.map((exercise: Exercise, index: number) => {
                const formattedTitle = exercise.name
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                const localImage = exerciseImages[exercise.id];

                return (
                  <ExerciseDetailCards
                    key={exercise.id}
                    id={exercise.id}
                    stepNumber={index + 1}
                    title={formattedTitle}
                    image={localImage}
                    time={{
                      duration: Number(exercise.duration) || 0,
                      setcount: Number(exercise.setcount) || 0,
                      repetitions: Number(exercise.repetitions) || 0,
                    }}
                    steps={
                      isEnglish ? exercise.steps_en || {} : exercise.steps || {}
                    }
                    steps_en={exercise.steps_en || {}}
                  />
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Sabit Alt Buton */}
      <View pointerEvents="box-none" style={styles.stickyButtonWrap}>
        <RoundedButton
          style={styles.activitySummaryButton}
          text={t('activityModule.startButton')}
          onPress={onStart} // Parent'taki handleStart tetiklenir
        />
      </View>
    </View>
  );
};

export default ActivitySummary;
