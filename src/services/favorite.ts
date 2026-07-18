// utils/favorites.ts
import {api} from './api';
import {store} from '../store';
import {setFavoriteWorkouts} from '../store/slices/favoriteWorkoutSlice';

// Favori workout'ları çekmek için genel fonksiyon
export const fetchFavoriteWorkouts = async () => {
  try {
    const {data} = await api.get('/api/favorites/workout', {
      requiresAuth: true,
    });
    const payload = data?.data ?? data ?? [];
    store.dispatch(setFavoriteWorkouts(Array.isArray(payload) ? payload : []));
    return payload;
  } catch (error) {
    console.error('Favori workoutlar çekilemedi:', error);
    store.dispatch(setFavoriteWorkouts([]));
    return [];
  }
};

export const toggleFavorite = async (
  workoutId: number | string,
): Promise<boolean> => {
  try {
    await api.post('/api/favorites/workout', {workoutId}, {requiresAuth: true});

    await fetchFavoriteWorkouts();
    return true;
  } catch (error) {
    console.error('Favori işlemi başarısız:', error);
    return false;
  }
};
