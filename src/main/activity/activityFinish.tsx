import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClock, faFire, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Loader from '../../../components/Loader';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import useStyles from './styles';
import { WorkoutDetails } from './types';

interface SummaryItemProps {
  icon: IconProp;
  label: string;
  value: string;
  color: string;
}

interface ActivityFinishProps {
  workoutData: WorkoutDetails;
  onDone: () => void;
  isCustomWorkout: boolean;
}

const ActivityFinish: React.FC<ActivityFinishProps> = ({
  workoutData,
  onDone,
  isCustomWorkout,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const [isSaving, setIsSaving] = useState(true);

  const workoutPoints = useMemo(() => {
    if (!workoutData?.difficulty || !workoutData?.exercises) return 0;
    const multiplier =
      workoutData.difficulty === 'advanced'
        ? 3
        : workoutData.difficulty === 'intermediate'
          ? 2
          : 1;
    return workoutData.exercises.length * 10 * multiplier;
  }, [workoutData]);

  useEffect(() => {
    
    const saveProgress = async () => {
      try {
        const statsRes = await api.get('/api/user/statistics', {
          requiresAuth: true,
        });
        if (statsRes.status === 200 && statsRes.data) {
          const newUserStatistics = {
            completedWorkoutCount:
              (Number(statsRes.data.completed_workouts) || 0) + 1,
            totalCaloriesBurned:
              (Number(workoutData.calories) || 0) +
              (Number(statsRes.data.total_calories) || 0),
            totalWorkoutDuration:
              (Number(workoutData.time) || 0) +
              (Number(statsRes.data.total_exercise_duration) || 0),
            userWorkoutPoint:
              (Number(statsRes.data.total_score) || 0) + workoutPoints,
          };
          await api.post('/api/user/statistics', newUserStatistics, {
            requiresAuth: true,
          });
        }
        
        // 2. Tamamlanan Antrenmanı Logla
        await api.post(
          '/api/user/completed_workout',
          {
            calories: workoutData.calories,
            duration: workoutData.time,
            score: workoutPoints,
          },
          { requiresAuth: true },
        );

        // 3. Statik Antrenman Tamamlama Kaydı
        if (!isCustomWorkout) {
          await api.post(
            '/api/static_workout_complete',
            {
              workout_id: workoutData.id,
            },
            { requiresAuth: true },
          );
        }
      } catch (error) {
        console.error('Veri kaydetme hatası:', error);
      } finally {
        setIsSaving(false);
      }
    };

    saveProgress();
  }, [
    workoutData?.calories,
    workoutData?.id,
    workoutData?.time,
    workoutPoints,
    isCustomWorkout,
  ]);

  if (!workoutData) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} dk`;
  };

  return (
    <View style={styles.container}>
      {/* Kutlama Animasyonu */}
      <View style={styles.animationContainer}>
        <Loader animationName="confetti" />
      </View>

      <Text style={styles.congratsText}>Harika İş Çıkardın!</Text>
      <Text style={styles.subText}>Antrenmanı başarıyla tamamladın.</Text>

      {/* Özet Paneli */}
      <View style={styles.summaryGrid}>
        <SummaryItem
          icon={faClock as IconProp}
          label="Süre"
          value={formatTime(workoutData.time)}
          color={theme.colors.green}
        />
        <SummaryItem
          icon={faFire as IconProp}
          label="Kalori"
          value={`${workoutData.calories} kcal`}
          color={theme.colors.accent}
        />
        <SummaryItem
          icon={faStar as IconProp}
          label="Puan"
          value={`+${workoutPoints}`}
          color={theme.colors.warning}
        />
      </View>

      {/* Alt Buton */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={onDone}
        disabled={isSaving}
      >
        <Text style={styles.doneButtonText}>
          {isSaving ? 'Kaydediliyor...' : 'Ana Sayfaya Dön'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActivityFinish;

// Yardımcı Özet Bileşeni
const SummaryItem = ({ icon, label, value, color }: SummaryItemProps) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.summaryItem}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <FontAwesomeIcon icon={icon as IconProp} color={color} size={20} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
};
