import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faStar as outlineStar } from '@fortawesome/free-regular-svg-icons';
import {
  faBolt,
  faClock,
  faDumbbell,
  faStar as solidStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { memo, useMemo } from 'react';
import {
  AccessibilityState,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { primitives } from '../styles/colors';
import i18n from '../src/locales/i18n';
import {
  difficultyLabelTR,
  Ex,
  formatGeneralDuration,
} from '../src/services/activity';
import { ThemeType, useTheme } from '../src/theme';

export interface ExerciseLite {
  calories?: number;
  duration?: number;
  setcount?: number;
  repetitions?: number;
}

export interface WorkoutLite {
  id: string | number;
  name: string;
  name_en: string;
  difficulty?: string | number;
  exercises?: ExerciseLite[];
}

interface ExerciseCardProps {
  workout: WorkoutLite;
  image?: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number) => void;
  onPress?: () => void;
  style?: ViewStyle;
  shadowColor?: string;
  testID?: string;
}

const calculateExerciseTime = (ex: Ex) => {
  const repetitions = Number(ex.repetitions) || 0;
  const setcount = Number(ex.setcount) || 0;
  const duration = Number(ex.duration) || 0;
  const restTime = Math.max(setcount - 1, 0) * duration;
  const exerciseTime =
    (repetitions === 0 ? 1 : repetitions) * duration * setcount;
  return restTime + exerciseTime;
};

const calculateWorkoutTime = (exercises: Ex[] = []) =>
  exercises.reduce((acc, ex) => acc + calculateExerciseTime(ex), 0);

const ExerciseCard: React.FC<ExerciseCardProps> = memo(
  ({
    workout,
    image,
    isFavorite,
    onToggleFavorite,
    onPress,
    style,
    shadowColor = primitives.slate300,
    testID,
  }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const { totalCalories, totalDuration } = useMemo(() => {
      const list = Array.isArray(workout.exercises) ? workout.exercises : [];
      const calories = list.reduce(
        (acc, it) => acc + (Number(it.calories) || 0),
        0,
      );
      const duration = calculateWorkoutTime(list);
      return { totalCalories: calories, totalDuration: duration };
    }, [workout.exercises]);

    const pressableState: AccessibilityState = { disabled: !onPress };

    const currentLanguage = i18n.language || 'tr';
    const isEnglish = currentLanguage === 'en';

    const Content = (
      <View style={styles.row}>
        {image ? <Image source={image} style={styles.image} /> : null}
        <View style={styles.textContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {isEnglish ? workout.name_en : workout.name}
          </Text>
          <View style={styles.iconRow}>
            <FontAwesomeIcon
              icon={faClock as IconProp}
              size={14}
              style={styles.icon}
            />
            <Text style={styles.metaText}>
              {formatGeneralDuration(totalDuration)}
            </Text>

            <FontAwesomeIcon
              icon={faDumbbell as IconProp}
              size={14}
              style={styles.icon}
            />
            <Text style={styles.metaText}>
              {difficultyLabelTR(workout.difficulty)}
            </Text>

            <FontAwesomeIcon
              icon={faBolt as IconProp}
              size={14}
              style={styles.icon}
            />
            <Text style={styles.metaText}>{`${totalCalories} Kcal`}</Text>
          </View>
        </View>
      </View>
    );

    return (
      <View style={[styles.cardContainer, style, { shadowColor }]}>
        <Pressable
          onPress={() => onToggleFavorite(workout.id)}
          hitSlop={10}
          style={styles.favoriteIcon}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Favoriden çıkar' : 'Favorilere ekle'
          }
        >
          <FontAwesomeIcon
            icon={
              isFavorite ? (solidStar as IconProp) : (outlineStar as IconProp)
            }
            size={18}
            color={
              isFavorite ? theme.colors.primary : theme.colors.textPrimary
            }
          />
        </Pressable>

        {onPress ? (
          <Pressable
            onPress={onPress}
            style={styles.flex}
            accessibilityRole="button"
            accessibilityState={pressableState}
            testID={testID}
            android_ripple={{ borderless: false }}
          >
            {Content}
          </Pressable>
        ) : (
          <View style={styles.flex}>{Content}</View>
        )}
      </View>
    );
  },
);

export default ExerciseCard;

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    cardContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.border,
      borderColor: theme.colors.textPrimary,
      borderRadius: 16,
      borderWidth: 2,
      flexDirection: 'row',
      marginVertical: 8,
      padding: 8,
      position: 'relative',
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    favoriteIcon: {
      position: 'absolute',
      right: 8,
      top: 8,
      zIndex: 1,
    },
    flex: {
      flex: 1,
    },
    icon: {
      color: theme.colors.textPrimary,
      marginRight: 4,
    },
    iconRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    image: {
      borderRadius: 12,
      height: 60,
      marginRight: 12,
      resizeMode: 'cover',
      width: 60,
    },
    metaText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      marginRight: 8,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    textContent: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
  });
