export type ExerciseType = 'warmup' | 'main' | 'cool_down';
export type WorkoutStatus = 'active' | 'rest' | 'paused' | 'initial';

export interface Exercise {
  id: number;
  name: string;
  name_en?: string;
  exercise_type: ExerciseType;
  duration: number;
  rest_duration?: number;
  setcount: number;
  repetitions: number;
  steps?: Record<string, string>;
  steps_en?: Record<string, string>;
  video_url?: string;
  description?: string;
  description_en?: string;
}

export interface WorkoutDetails {
  id: number;
  name: string;
  name_en?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  exercises: Exercise[];
  time: number;
}

export interface WorkoutData {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  time: number; // Toplam antrenman süresi
  exercises: Exercise[];
  body_region_id: number;
  custom_workout: boolean;
  is_with_equipment: boolean;
  workout_place: string;
  workout_types: string;
}

export type GroupedExercises = Record<ExerciseType, Exercise[]>;
