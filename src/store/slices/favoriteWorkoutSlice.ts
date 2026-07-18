import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface FavoriteWorkoutState {
  favorite_workouts: any[];
}

const initialState: FavoriteWorkoutState = {
  favorite_workouts: [],
};

const favoriteWorkoutsSlice = createSlice({
  name: 'favoriteWorkouts',
  initialState,
  reducers: {
    setFavoriteWorkouts: (state, action: PayloadAction<any[]>) => {
      state.favorite_workouts = action.payload;
    },
  },
});

export const {setFavoriteWorkouts} = favoriteWorkoutsSlice.actions;
export default favoriteWorkoutsSlice.reducer;
