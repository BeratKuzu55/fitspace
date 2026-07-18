import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Exercise {
  id: number;
  name: string;
  name_en: string;
  duration: number;
  setcount: number;
  repetitions: number;
  exercise_type: string;
  video_url: string;
  rest_duration: number;
  calories: number;
  general_duration: number;
  description: string;
  description_en: string;
  steps: { step1: string, step2: string, step3: string, step4: string, step5: string,}
  steps_en: { step1: string, step2: string, step3: string, step4: string, step5: string,}
}

export const ActivityDescriptions = {
  CompleteStaticWorkout: 'StaticWorkout',
  CompleteExereyeWorkout: 'ExereyeWorkout',
};

interface ExerciseState {
  allExercises: Exercise[];
  remainingExercises: Exercise[];
  currentExercise: Exercise | null;
  completedExercises: Exercise[];
  activityDescription: string;
  exerciseLibrary: Exercise[];
}

const initialState: ExerciseState = {
  allExercises: [],
  remainingExercises: [],
  currentExercise: null,
  completedExercises: [],
  activityDescription: '',
  exerciseLibrary: [],
};

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    setAllExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.allExercises = action.payload;
    },
    setRemainingExercises: (state, action: PayloadAction<any[]>) => {
      state.remainingExercises = action.payload;
    },
    setCompletedExercises: (state, action: PayloadAction<any[]>) => {
      state.completedExercises = action.payload;
    },
    setCurrentExercise: (state, action: PayloadAction<Exercise>) => {
      state.currentExercise = action.payload;
    },
    setActivityDescription: (state, action: PayloadAction<string>) => {
      state.activityDescription = action.payload;
    },
    setExerciseLibrary:(state, action: PayloadAction<any[]>) => {
      state.exerciseLibrary = action.payload;
    },
  },
});

export const {
  setAllExercises,
  setRemainingExercises,
  setCompletedExercises,
  setCurrentExercise,
  setActivityDescription,
  setExerciseLibrary
} = exerciseSlice.actions;
export default exerciseSlice.reducer;
