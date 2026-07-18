import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faClock,
  faDumbbell,
  faFire,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useMemo } from 'react';
import type React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { Text, TouchableOpacity, View } from 'react-native';
import { primitives } from '../styles/colors';
import i18n from '../src/locales/i18n';
import {
  difficultyLabelTR,
  Ex,
  formatGeneralDuration,
} from '../src/services/activity';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { TopFiveCardProps } from './types';
import { PLACEHOLDER_IMAGE } from '../src/assets/imageMaps';

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

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return primitives.gold500; // Altın Sarısı
    case 2:
      return primitives.slate400; // Gümüş/Gri tonu (en yakın: slate400)
    case 3:
      return primitives.orange500; // Bronz/Turuncu
    default:
      return primitives.orange600;
  }
};

const TopFiveCard: React.FC<TopFiveCardProps> = ({
  workout,
  image,
  rank,
  onPress,
}) => {
  const rankColor = getRankColor(rank);
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const currentLanguage = i18n.language || 'tr';
  const isEnglish = currentLanguage === 'en';

  const { totalCalories, totalDuration } = useMemo(() => {
    const list = Array.isArray(workout.exercises) ? workout.exercises : [];
    const calories = workout.calories
      ? workout.calories
      : list.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);

    const exList: Ex[] = list.map(ex => ({
      repetitions: ex.repetitions,
      setcount: ex.setcount,
      duration: ex.duration,
    }));
    const duration = calculateWorkoutTime(exList);
    return {
      totalCalories: calories,
      totalDuration: duration,
    };
  }, [workout.exercises, workout.calories]);

  const CardContent = (
    <View style={styles.tfCard}>
      <View style={styles.awardContainer}>
        <FontAwesomeIcon
          icon={faTrophy as IconProp}
          size={40}
          color={rankColor}
        />

        <View style={styles.awardTextContainer}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.tfTitle} numberOfLines={1} ellipsizeMode="tail">
          {isEnglish ? workout.name_en : workout.name}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesomeIcon
              icon={faClock as IconProp}
              size={13}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.statText}>
              {formatGeneralDuration(totalDuration)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <FontAwesomeIcon
              icon={faDumbbell as IconProp}
              size={13}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.statText}>
              {difficultyLabelTR(workout.difficulty)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <FontAwesomeIcon
              icon={faFire as IconProp}
              size={13}
              color={theme.colors.accent}
            />
            <Text style={styles.statText}>{`${totalCalories} Kcal`}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tfImageContainer}>
        <FastImage
          source={image || PLACEHOLDER_IMAGE}
          style={styles.tfImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>

      <View style={[styles.gradientShadow, { backgroundColor: rankColor }]} />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{CardContent}</View>;
};

export default TopFiveCard;
