import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import ExerciseCard from '../../../../components/exerciseCards.tsx';
import Loader from '../../../../components/Loader.tsx';
import useGlobalStyles from '../../../../styles/styles.ts';
import { api } from '../../../services/api.ts';
import {
  fetchFavoriteWorkouts,
  toggleFavorite,
} from '../../../services/favorite.ts';
import { useAppSelector } from '../../../store';
import { useTheme } from '../../../theme';
import FilterModal from './filterModal.tsx';
import useStyles from './styles.ts';

import { PLACEHOLDER_IMAGE, workoutImages } from '../../../assets/imageMaps';
import { Equipment } from '../../exereyes/types.ts';
import { Exercise, WorkoutData } from '../../activity/types.ts';

type QuickStartProps = Record<string, never>;

const QuickStart: React.FC<QuickStartProps> = () => {
  const route = useRoute<any>();
  const { place = 'home' } = route?.params ?? {};
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  const [isLoading, setIsLoading] = useState(true);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutData[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>(
    [],
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<
    'all' | 'no_equipment' | 'equipped'
  >('all');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(
    [],
  );

  const favorite_workouts = useAppSelector(
    state => state.favoriteWorkouts.favorite_workouts,
  );

  const userDiseases = useAppSelector(state => state.user.userDiseases);

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  // 2. Sadece Saf Veri API İstekleri
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [workoutRes, equipmentRes] = await Promise.all([
          api.get('/api/workouts', {
            signal: controller.signal,
            requiresAuth: true,
          }),
          api.get('/api/equipments', {
            signal: controller.signal,
            requiresAuth: true,
          }),
          fetchFavoriteWorkouts(),
        ]);

        if (!isActive) return;

        setAllWorkouts(workoutRes.data ?? []);
        setAvailableEquipments(equipmentRes.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [navigation, userDiseases]);

  const filteredWorkouts = useMemo(() => {
    const baseList = allWorkouts.filter(
      w => w.workout_place === place || w.workout_place === 'all',
    );
    return baseList.filter((workout: WorkoutData) => {
      if (filterType === 'no_equipment') return !workout.is_with_equipment;
      if (filterType === 'equipped') {
        if (!workout.is_with_equipment) return false;
        const requiredIds = new Set<number>();
        workout.exercises?.forEach((ex: Exercise) =>
          ex.equipments?.forEach((eq: Equipment) => requiredIds.add(eq.id)),
        );
        return Array.from(requiredIds).every(id =>
          selectedEquipmentIds.includes(id),
        );
      }
      return true;
    });
  }, [allWorkouts, place, filterType, selectedEquipmentIds]);

  // 4. RenderItem: Doğrudan asset haritasından resim alıyoruz
  const renderWorkout = useCallback(
    ({ item }: { item: WorkoutData }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ActivityManager', { workoutId: String(item.id) })
        }
      >
        <ExerciseCard
          workout={item}
          // Resim doğrudan statik require nesnesi olarak gönderiliyor
          image={workoutImages[item.id] || PLACEHOLDER_IMAGE}
          isFavorite={favorite_workouts.some(
            w => String(w.id) === String(item.id),
          )}
          onToggleFavorite={() => toggleFavorite(Number(item.id))}
        />
      </TouchableOpacity>
    ),
    [favorite_workouts, navigation],
  );

  if (isLoading) return <Loader />;

  return (
    <View style={globalStyles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            globalStyles.header,
            globalStyles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          {t(`quickStart.title.${place === 'home' ? 'home' : 'outdoor'}`)}
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            styles.filterCircle,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <FontAwesomeIcon
            icon={faFilter as IconProp}
            size={16}
            color={theme.colors.onPrimary}
          />
          {(filterType !== 'all' || selectedEquipmentIds.length > 0) && (
            <View style={styles.activeDot} />
          )}
        </TouchableOpacity>
      </View>
      <View>
        {filteredWorkouts.length === 0 ? (
          <Text>
            {t('quickStart.noWorkoutsFound') ||
              'No workouts found check your diseases'}
          </Text>
        ) : (
          <FlatList
            data={filteredWorkouts}
            keyExtractor={item => String(item.id)}
            renderItem={renderWorkout}
            removeClippedSubviews={true}
            windowSize={5}
            initialNumToRender={8}
          />
        )}
      </View>
      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        filterType={filterType}
        setFilterType={setFilterType}
        availableEquipments={availableEquipments}
        selectedIds={selectedEquipmentIds}
        toggleEquipment={id =>
          setSelectedEquipmentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
          )
        }
        onReset={() => {
          setFilterType('all');
          setSelectedEquipmentIds([]);
        }}
      />
    </View>
  );
};

export default QuickStart;
