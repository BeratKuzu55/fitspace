import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import exerciseReducer from './slices/exerciseSlice';
import equipmentReducer from './slices/exereyeEquipmentSlice';
import articleReducer from './slices/articleSlice';
import activityReducer from './slices/activitySlice';
import favoriteWorkoutReducer from './slices/favoriteWorkoutSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exercise: exerciseReducer,
    equipment: equipmentReducer,
    article: articleReducer,
    activity: activityReducer,
    favoriteWorkouts: favoriteWorkoutReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
