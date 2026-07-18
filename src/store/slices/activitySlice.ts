import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface ActivityState {
  isPaused: boolean;
  isFinished: boolean;
  pauseTime: number;
  setCount: number;
  passNextExercise: boolean;
  isUserResting: boolean;
  workoutDetails: {
    id:number;
    wtype: string;
    name: string;
    name_en: string;
    calories: number;
    difficulty: string;
    time: number;
    workout_points?: number;
  };
  isLoadingSummary: boolean;
  turnBackActivitySummary: boolean;
}

const initialState: ActivityState = {
  isPaused: false,
  isFinished: false,
  pauseTime: 0,
  setCount: 1,
  passNextExercise: false,
  isUserResting: false,
  workoutDetails: {
    id: 0,
    wtype: "static",
    name: '',
    name_en: '',
    calories: 0,
    difficulty: '',
    time: 0,
    workout_points: 0,
  },
  isLoadingSummary: true,
  turnBackActivitySummary: false,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setIsPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },
    setIsFinished: (state, action: PayloadAction<boolean>) => {
      state.isFinished = action.payload;
    },
    setPauseTime: (state, action: PayloadAction<number>) => {
      state.pauseTime = action.payload;
    },
    setSetCount: (state, action: PayloadAction<number>) => {
      state.setCount = action.payload;
    },
    setPassNextExercise: (state, action: PayloadAction<boolean>) => {
      state.passNextExercise = action.payload;
    },
    setWorkoutDetails: (
      state,
      action: PayloadAction<{
        id:number;
        wtype:string;
        name: string;
        name_en: string;
        calories: number;
        difficulty: string;
        time: number;
        workout_point?: number;
      }>,
    ) => {
      state.workoutDetails = action.payload;
    },
    setIsUserResting: (state, action: PayloadAction<boolean>) => {
      state.isUserResting = action.payload;
    },
    setIsLoadingSummary: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSummary = action.payload;
    },
    setTurnBackActivitySummary: (state, action: PayloadAction<boolean>) => {
      state.turnBackActivitySummary = action.payload;
    },
  },
});

export const {
  setIsPaused,
  setIsFinished,
  setPauseTime,
  setSetCount,
  setPassNextExercise,
  setWorkoutDetails,
  setIsUserResting,
  setIsLoadingSummary,
  setTurnBackActivitySummary,
} = activitySlice.actions;
export default activitySlice.reducer;
