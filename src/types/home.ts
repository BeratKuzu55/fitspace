interface Workout {
  name: string;
  difficulty: string;
  description: string;
  sets: number;
  isFavorited: boolean;
  id: number;
  created_at: string;
  updated_at: string;
  body_region_id: number;
  workout_place: string;
  exercises: any[];
  workoutTypes: any[];
}

interface Article {
  id: number;
  title: string;
  title_en?: string;
  text: string;
  text_en?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Program {
  name: string;
  duration_weeks: number;
  level: string;
  description: string;
  id: number;
  created_at: string;
  updated_at: string;
  day_workouts: DayWorkout[];
}

interface DayWorkout {
  id: number;
  day: number;
  workout: Workout;
}

interface Workout {
  name: string;
  name_en: string;
  difficulty: string;
  description: string;
  description_en: string;
  workoutpoint: number;
  id: number;
  created_at: string;
  updated_at: string;
  body_region_id: number;
  workout_place: string;
  calories: number;
}
