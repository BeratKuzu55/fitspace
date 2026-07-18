import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleInfo,
  faDumbbell,
  faHeartbeat,
  faRunning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Loader from '../../../components/Loader';
import RoundedButton from '../../../components/RoundedButton';
import ExerciseDetailCard from '../activity/exerciseDetailCards';
import { exerciseImages, PLACEHOLDER_IMAGE } from '../../assets/imageMaps';
import { api } from '../../services/api';
import { useAppSelector } from '../../store';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import { BodyRegion, REGION_IMAGES } from './types';

type Props = Record<string, never>;

type EquipmentExercise = {
  id: number;
  name: string;
  name_en?: string;
  duration: number;
  rest_duration: number;
  calories: number;
  repetitions: number;
  setcount: number;
  body_region: number;
  steps?: Record<string, string>;
  steps_en?: Record<string, string>;
  exercise_type?: string;
  exercise_group?: string;
  exercise_format?: string;
};

const ExerciseConfigure: React.FC<Props> = () => {
  const equipments = useAppSelector(state => state.equipment.equipments);
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t, i18n } = useTranslation();

  // --- STATE ---
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bodyRegions, setBodyRegions] = useState<BodyRegion[]>([]);
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<number[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('2'); // Default: Strength (2)
  const [intensity, setIntensity] = useState<number>(10);
  const [displayIntensity, setDisplayIntensity] = useState<number>(10);
  const [exercises, setExercises] = useState<EquipmentExercise[]>([]);
  const [exerciseBodyRegions, setExerciseBodyRegions] = useState<BodyRegion[]>([]);
  // --- REFS (Performance) ---
  const liveIntensityRef = useRef<number>(10);
  const rafRef = useRef<number | null>(null);

  const displayedBodyRegions = useMemo(() => {
    // Eğer equipment'a göre egzersizler geldiyse, sadece bu egzersizlerde olan bölgeleri göster.
    // Aksi durumda (ilk yükleme/boş equipment) tüm bölgeleri göster.
    return exercises.length ? exerciseBodyRegions : bodyRegions;
  }, [bodyRegions, exerciseBodyRegions, exercises.length]);

  const bodyRegionRows = useMemo(() => {
    const regions = displayedBodyRegions;
    const n = regions.length;

    if (n <= 3) return [regions];
    if (n === 4) return [regions.slice(0, 2), regions.slice(2, 4)];
    if (n === 5) return [regions.slice(0, 3), regions.slice(3, 5)];
    if (n === 6) return [regions.slice(0, 3), regions.slice(3, 6)];

    // Fallback: 3'lü satırlar halinde.
    const rows: BodyRegion[][] = [];
    for (let i = 0; i < n; i += 3) rows.push(regions.slice(i, i + 3));
    return rows;
  }, [displayedBodyRegions]);

  const visibleExercises = useMemo(() => {
    if (!exercises.length) return [];
    if (!selectedBodyRegions.length) return exercises;
    const allowed = new Set(selectedBodyRegions);
    return exercises.filter(ex => allowed.has(ex.body_region));
  }, [exercises, selectedBodyRegions]);

  const formatExerciseTitle = useCallback(
    (ex: EquipmentExercise) => {
      const raw =
        i18n.language === 'en' ? ex.name_en || ex.name : ex.name || ex.name_en || '';
      return raw
        .split('_')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    [i18n.language],
  );

  const options = useMemo(
    () => [
      {
        id: '1',
        label: 'exerciseConfigure.options.endurance',
        icon: faRunning,
        val: 'endurance',
      },
      {
        id: '2',
        label: 'exerciseConfigure.options.strength',
        icon: faDumbbell,
        val: 'strength',
      },
      {
        id: '3',
        label: 'exerciseConfigure.options.cardio',
        icon: faHeartbeat,
        val: 'cardio',
      },
    ],
    [],
  );

  // --- API: BODY REGIONS ---

  useEffect(() => {
    console.log('equipments', equipments);
    const fetchExercisesByEquipment = async () => {
      try {
        const response = await api.post<EquipmentExercise[]>("/api/exercises/byequipments", 
          {equipmentIds: equipments.map(eq => eq.id)}, {
            requiresAuth: true,
          })
          
        if (response.status === 200) {
          console.log('exercises', response.data);
          setExercises(response.data);
        }
      }catch(error) {
        console.error('Error fetching exercises by equipment:', error);
      }
    }
    fetchExercisesByEquipment();
  },[equipments])

  useEffect(() => {
    if (!exercises.length || !bodyRegions.length) return;
  
    // 1. Egzersizlerdeki benzersiz body_region ID'lerini toplayalım
    const uniqueRegionIds = new Set<number>();
    exercises.forEach(exercise => {
        uniqueRegionIds.add(exercise.body_region);
    });
  
    // 2. Bu ID'lere sahip olan nesneleri bodyRegions listesinden bulalım
    const filteredRegions = bodyRegions.filter(br => uniqueRegionIds.has(br.id));
  
    // 3. State'i bir kerede güncelleyelim
    setExerciseBodyRegions(filteredRegions);
  
  }, [exercises, bodyRegions]);

  useEffect(() => {
    if (!exercises.length) return;

    const allowedIds = new Set<number>(exerciseBodyRegions.map(r => r.id));

    setSelectedBodyRegions(prev => {
      const next = prev.filter(id => allowedIds.has(id));

      if (next.length === 0 && exerciseBodyRegions.length > 0) {
        return [exerciseBodyRegions[0].id];
      }

      const isSame =
        next.length === prev.length && next.every((id, idx) => id === prev[idx]);
      return isSame ? prev : next;
    });
  }, [exerciseBodyRegions, exercises.length]);


  useEffect(() => {
    const fetchBodyRegions = async () => {
      try {
        const response = await api.get<BodyRegion[]>('/api/bodyregion', {
          requiresAuth: true,
        });
        if (response.status === 200) {
          setBodyRegions(response.data);
          // Varsayılan bölge seçimi (Örn: Back)
          const backRegion = response.data.find(
            r => r.name.toLowerCase() === 'back',
          );
          if (backRegion) setSelectedBodyRegions([backRegion.id]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification(
          t('exerciseConfigure.notifications.errorTitle'),
          t('exerciseConfigure.alerts.fetchError'),
          'danger',
        );
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBodyRegions();
  }, [t]);


  // --- SLIDER LOGIC (Optimized) ---
  const onValueChange = useCallback((value: number) => {
    liveIntensityRef.current = value;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setDisplayIntensity(Math.round(liveIntensityRef.current));
        rafRef.current = null;
      });
    }
  }, []);

  const handleGenerateWorkout = useCallback(async () => {
    setSubmitLoading(true);
    try {
      const targetGoal =
        options.find(o => o.id === selectedGoal)?.val || 'strength';

      const payload = {
        equipmentIds: equipments.map(eq => eq.id),
        bodyRegionIds: selectedBodyRegions,
        difficulty: intensity,
        exercise_format: targetGoal,
      };

      const response = await api.post('/api/exereye', payload, {
        requiresAuth: true,
      });

      if (response.status === 200 && response.data) {
        navigation.navigate('ActivityManager', {
          customWorkout: {
            exercises: response.data.exercises,
            workoutInformations: {
              ...response.data.workoutInformations,
              name: 'Exereyes Workout',
            },
          },
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert(
        t('exerciseConfigure.notifications.errorTitle'),
        t('exerciseConfigure.notifications.fetchError'),
      );
    } finally {
      setSubmitLoading(false);
    }
  }, [
    equipments,
    intensity,
    navigation,
    options,
    selectedBodyRegions,
    selectedGoal,
    t,
  ]);

  if (initialLoading || submitLoading) return <Loader />;

  return (
    <ScrollView style={styles.container}>
      {/* Bölge Seçimi */}
      <InfoRow
        label={t('exerciseConfigure.labels.selectRegion')}
        theme={theme}
        styles={styles}
      />
      <View style={styles.regionGrid}>
        {bodyRegionRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.regionRow}>
            {row.map(region => (
              <View key={region.id} style={styles.regionCardWrap}>
                <RegionCard
                  region={region}
                  isSelected={selectedBodyRegions.includes(region.id)}
                  onPress={() => {
                    const isAlreadySelected = selectedBodyRegions.includes(
                      region.id,
                    );
                    if (isAlreadySelected) {
                      setSelectedBodyRegions(prev =>
                        prev.filter(id => id !== region.id),
                      );
                    } else if (selectedBodyRegions.length < 1) {
                      setSelectedBodyRegions(prev => [...prev, region.id]);
                    } else {
                      showNotification(
                        t('exerciseConfigure.notifications.errorTitle'),
                        t('exerciseConfigure.notifications.maxRegions'),
                        'info',
                      );
                    }
                  }}
                  styles={styles}
                />
              </View>
            ))}
          </View>
        ))}
      </View>

     

      {/* Hedef Seçimi */}
      {/*
        <InfoRow
        label={t('exerciseConfigure.labels.selectGoalEquipment')}
        theme={theme}
        styles={styles}
      />
      <View style={styles.buttonGroup}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedGoal === option.id && styles.optionSelected,
            ]}
            onPress={() => setSelectedGoal(option.id)}
          >
            <FontAwesomeIcon
              icon={option.icon as IconProp}
              style={styles.optionIcon}
              color={
                selectedGoal === option.id
                  ? theme.colors.onPrimary
                  : theme.colors.primary
              }
            />
            <Text
              style={[
                styles.optionLabel,
                selectedGoal === option.id && styles.optionLabelSelected,
              ]}
            >
              {t(option.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      */}

      {/* Yoğunluk Ayarı */}
      {/*
      <InfoRow
        label={t('exerciseConfigure.labels.adjustIntensity')}
        theme={theme}
        styles={styles}
      />
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>{displayIntensity}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={intensity}
          onValueChange={onValueChange}
          onSlidingComplete={setIntensity}
          minimumTrackTintColor={theme.colors.primary}
          thumbTintColor={theme.colors.primary}
        />
      </View>
        */
      }

      <RoundedButton
        text={t('exerciseConfigure.cta')}
        onPress={handleGenerateWorkout}
      />

{visibleExercises.length > 0 && (
        <View>
          {visibleExercises.map((ex, index) => (
            <ExerciseDetailCard
              key={ex.id}
              id={ex.id}
              stepNumber={index + 1}
              title={formatExerciseTitle(ex)}
              image={exerciseImages[ex.id] || PLACEHOLDER_IMAGE}
              time={{
                duration: Number(ex.duration) || 0,
                setcount: Number(ex.setcount) || 0,
                repetitions: Number(ex.repetitions) || 0,
              }}
              steps={ex.steps || {}}
              steps_en={ex.steps_en || {}}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ label, styles, theme }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoRowLeft}>
      <FontAwesomeIcon
        icon={faCircleInfo as IconProp}
        size={16}
        style={styles.infoIcon}
        color={theme.colors.border}
      />
      <Text style={styles.infoText}>{label}</Text>
    </View>
  </View>
);

const RegionCard = ({ region, isSelected, onPress, styles }: any) => {
  const imageSource: number =
    REGION_IMAGES[region.name.toLowerCase()] ?? REGION_IMAGES.default;

  return (
    <TouchableOpacity
      style={[styles.regionCard, isSelected && styles.selectedRegionCard]}
      onPress={onPress}
    >
      <FastImage
        source={imageSource}
        style={styles.cardImage}
        resizeMode={FastImage.resizeMode.contain}
      />
      <View
        style={[
          styles.cardTextContainer,
          isSelected && styles.selectedCardTextContainer,
        ]}
      >
        <Text style={styles.cardText}>{region.name.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseConfigure;
