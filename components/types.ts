import React from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { ThemeType } from '../src/theme';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

interface AlertStyles {
  overlay: ViewStyle;
  alertContainer: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  buttonContainer: ViewStyle;
  alertButton: ViewStyle;
  cancelButtonText: TextStyle;
  confirmButtonText: TextStyle;
}

interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
  type?: 'googleRed' | 'green' | 'purple600' | 'gray700';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  theme: ThemeType;
  styles: AlertStyles;
  t: (key: string) => string;
}

type AccordionItemProps = {
  question: string;
  answer: string;
};

interface PickerStyles {
  dialButton: ViewStyle;
  dialText: TextStyle;
  modalBackdrop: ViewStyle;
  modalCard: ViewStyle;
  modalTitle: TextStyle;
  searchRow: ViewStyle;
  searchInput: TextStyle;
  countryRow: ViewStyle;
  cancelBtn: ViewStyle;
}

type DialCodePickerProps = {
  value: string;
  onChange: (dial: string) => void;
  theme: ThemeType;
  styles: PickerStyles;
};

type AnimationName = 'default' | 'confetti';
type LoaderProps = {
  animationName?: AnimationName;
  loop?: boolean;
  autoPlay?: boolean;
  duration?: number;
};

type PasswordInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

type ProfileButtonProps = {
  title: string;
  icon: IconProp;
  onPress: () => void;
};

interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
}

type RadioButtonProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
};

interface ReleaseNoteItem {
  version: string;
  date: string;
  changes: string[];
}

interface RNModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: ReleaseNoteItem[];
  title?: string;
}

interface RBProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

type SRBProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
};

type SegmentSwitchProps = {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
};

type StatType = 'calorie' | 'duration' | 'loginStreak' | 'score' | 'workouts';

interface StatisticsCardProps {
  type: StatType;
  value: number;
  title?: string;
  suffix?: string;
  backgroundColor?: string;
  textColor?: string;
  iconContainerColor?: string;
}

type Period = 'week' | 'month';

interface StatisticsChartProps {
  last7DaysWorkouts: CompletedWorkout[];
  last30DaysWorkouts?: CompletedWorkout[];
  initialPeriod?: Period;
  normalize?: boolean;
  colors?: {
    background?: string;
    card?: string;
    text?: string;
    lineCalories?: string;
    lineCount?: string;
  };
}

interface UserStats {
  completed_workouts: number;
  total_calories: number;
  total_exercise_duration: number;
  login_streak: number;
  total_score: number;
}

interface CompletedWorkout {
  calories: number;
  complete_date: string;
  id: number;
  user_id: number;
  duration: number;
  workout_id: number;
  score: number;
}

interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface ExerciseLite {
  calories?: number;
  duration?: number;
  setcount?: number;
  repetitions?: number;
}

interface WorkoutLite {
  id: number | string;
  name: string;
  name_en: string;
  difficulty?: string | number;
  calories?: number;
  exercises?: ExerciseLite[];
}

interface TopFiveCardProps {
  workout: WorkoutLite;
  image: ImageSourcePropType | { uri: string };
  rank: number;
  onPress?: () => void;
}

export type {
  AlertProps,
  AlertStyles,
  AccordionItemProps,
  DialCodePickerProps,
  PickerStyles,
  AnimationName,
  LoaderProps,
  PasswordInputProps,
  ProfileButtonProps,
  ProgressIndicatorProps,
  RadioButtonProps,
  RNModalProps,
  RBProps,
  SRBProps,
  SegmentSwitchProps,
  StatisticsCardProps,
  StatType,
  StatisticsChartProps,
  UserStats,
  CompletedWorkout,
  PieChartData,
  ExerciseLite,
  WorkoutLite,
  TopFiveCardProps,
};
