interface Workout {
  name: string;
  calories: number;
  difficulty: string;
  time: number;
  workout_points?: number;
}

interface Program {
  image: any;
  body_region: any;
  id: number;
  name: string;
  name_en: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  description: string;
  description_en: string;
  day_workouts: DayWorkout[];
  weeklyRegions: DayWorkout[] | null;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface DayWorkout {
  body_region: string;
  id: number;
  day: number;
  workout: Workout;
}

interface Workout {
  name: string;
  name_en: string;
  difficulty: string;
  description: string;
  sets: number;
  workoutpoint: number;
  id: number;
  created_at: string;
  updated_at: string;
  body_region_id: number;
  workout_place: string;
  calories: number;
}

type LevelFilter = 'beginner' | 'intermediate' | 'advanced';

interface Props {
  workout: Pick<Workout, 'name' | 'difficulty' | 'time' | 'calories'>;
  initialCountdown?: number;
  onFinished?: () => void;
}

interface Exercise {
  id: number;
  name: string;
  difficulty: string;
  description: string;
  duration: number;
  repetitions: number;
  calories: number;
  setcount: number;
  body_region_id: number;
  exercise_type: string;
  exercise_group: string;
  exercise_format: string;
  rest_duration: number;
  videoUrl?: string;
}

type VideoPlayerScreenProps = {
  currentExerciseId: number;
  isPaused: boolean;
};

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
