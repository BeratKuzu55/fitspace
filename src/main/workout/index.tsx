import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ExerciseCard from '../../../components/exerciseCards.tsx';
import Loader from '../../../components/Loader';
import { PLACEHOLDER_IMAGE, workoutImages } from '../../assets/imageMaps';
import { api } from '../../services/api.ts';
import {
  fetchFavoriteWorkouts,
  toggleFavorite,
} from '../../services/favorite.ts';
import { useAppSelector } from '../../store';
import { useTheme } from '../../theme';
import { WorkoutData } from '../activity/types.ts';
import { BodyRegion } from '../exereyes/types.ts';
import useStyles from './styles.ts';
import WorkoutScreenFilter from './workoutScreenFilter';

type WorkoutScreenProps = Record<string, never>;

const WorkoutScreen: React.FC<WorkoutScreenProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const navigation = useNavigation();

  const userDiseases = useAppSelector(state => state.user.userDiseases);
  // Ref ile Bellek Yönetimi
  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  // --- State ---
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('strength');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [bodyRegions, setBodyRegions] = useState<BodyRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const favoriteWorkouts = useAppSelector(
    state => state.favoriteWorkouts.favorite_workouts,
  );

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);
  // --- Data Fetching ---
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const signal = abortController.current.signal;
        const [regionsRes, workoutsRes] = await Promise.all([
          api.get('/api/bodyregion', { signal, requiresAuth: true }),
          api.get('/api/workouts', { signal, requiresAuth: true }),
        ]);

        if (isMounted.current) {
          if (regionsRes.status === 200) setBodyRegions(regionsRes.data);
          if (workoutsRes.status === 200) setWorkouts(workoutsRes.data);
        }
      } catch (error: unknown) {
        if (!axios.isCancel(error)) console.error('Loading error:', error);
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    };
    fetchAll();
    fetchFavoriteWorkouts();
  }, [userDiseases]);

  // --- Helpers ---
  const getImageForRegion = useCallback((regionName: string) => {
    const images: Record<string, ImageSourcePropType> = {
      leg: require('../../assets/images/body_regions/leg.png'),
      arm: require('../../assets/images/body_regions/arm.png'),
      abdomen: require('../../assets/images/body_regions/abdomen.png'),
      back: require('../../assets/images/body_regions/back.png'),
      chest: require('../../assets/images/body_regions/chest.png'),
      shoulder: require('../../assets/images/body_regions/shoulder.png'),
    };
    return images[regionName.toLowerCase()];
  }, []);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      if (selectedRegion) {
        const region = bodyRegions.find(
          r => r.name.toLowerCase() === selectedRegion,
        );
        if (!region || workout.body_region_id !== region.id) return false;
      }
      const hasGoal = selectedGoal
        ? workout.workout_types === selectedGoal
        : true;
      const hasEquipment = selectedEquipment
        ? workout.is_with_equipment === (selectedEquipment === '4') // 4: with equipment
        : true;
      const isFavorite = favoriteWorkouts.some(w => w.id === workout.id);
      return hasGoal && hasEquipment && (showOnlyFavorites ? isFavorite : true);
    });
  }, [
    workouts,
    selectedRegion,
    selectedGoal,
    selectedEquipment,
    showOnlyFavorites,
    favoriteWorkouts,
    bodyRegions,
  ]);

  const renderItem = ({ item }: { item: WorkoutData }) => {
    const isFav = favoriteWorkouts.some(w => w.id === item.id);
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ActivityManager', { workoutId: String(item.id) })
        }
      >
        <ExerciseCard
          workout={item}
          image={workoutImages[item.id] || PLACEHOLDER_IMAGE}
          isFavorite={isFav}
          onToggleFavorite={() => toggleFavorite(Number(item.id))}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredWorkouts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <WorkoutScreenFilter
            selectedGoal={selectedGoal}
            setSelectedGoal={setSelectedGoal}
            selectedEquipment={selectedEquipment}
            setSelectedEquipment={setSelectedEquipment}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
            bodyRegions={bodyRegions}
            getImageForRegion={getImageForRegion}
            theme={theme}
            styles={styles}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('workout.noWorkoutsFound') || 'Workout not found'}
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.scrollContent,
          filteredWorkouts.length === 0 && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
      />
    </View>
  );
};

export default WorkoutScreen;
