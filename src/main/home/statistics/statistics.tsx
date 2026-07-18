import { PUBLIC_BASE_URL } from '@env';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  View,
} from 'react-native';
import StatisticsCard from '../../../../components/StatisticsCard';
import StatisticsChart from '../../../../components/StatisticsChart';
import { CompletedWorkout, UserStats } from '../../../../components/types';
import { useTheme } from '../../../theme';
import { localStorage } from '../../../utils/localStorage';
import useStyles from './styles';

const UserStatisticsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [data, setData] = useState<{
    stats: UserStats | null;
    workouts: CompletedWorkout[];
  }>({
    stats: null,
    workouts: [],
  });
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getString('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, workoutsRes] = await Promise.all([
          axios.get(`${PUBLIC_BASE_URL}/api/user/statistics`, { headers }),
          axios.get(`${PUBLIC_BASE_URL}/api/user/completed_workout`, {
            headers,
          }),
        ]);

        setData({
          stats: statsRes.data,
          workouts: workoutsRes.data.response || [],
        });

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [fadeAnim]);

  const filteredData = useMemo(() => {
    const now = new Date();
    const getDiffDays = (dateStr: string) =>
      Math.ceil(
        Math.abs(now.getTime() - new Date(dateStr).getTime()) /
          (1000 * 60 * 60 * 24),
      );

    return {
      last7Days: data.workouts.filter(w => getDiffDays(w.complete_date) <= 7),
      last30Days: data.workouts.filter(w => getDiffDays(w.complete_date) <= 30),
    };
  }, [data.workouts]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const { stats } = data;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>{t('statistics.title')}</Text>

        <StatisticsCard
          type="loginStreak"
          value={stats?.login_streak || 0}
          iconContainerColor={theme.colors.primary}
        />
        <StatisticsCard
          type="duration"
          value={Math.floor((stats?.total_exercise_duration || 0) / 60)}
          iconContainerColor={theme.colors.accent}
        />
        <StatisticsCard
          type="score"
          value={stats?.total_score || 0}
          iconContainerColor={theme.colors.warning}
        />
        <StatisticsCard
          type="calorie"
          value={stats?.total_calories || 0}
          iconContainerColor={theme.colors.googleRed}
        />
        <StatisticsCard
          type="workouts"
          value={stats?.completed_workouts || 0}
          iconContainerColor={theme.colors.secondary}
        />

        <StatisticsChart
          last7DaysWorkouts={filteredData.last7Days}
          last30DaysWorkouts={filteredData.last30Days}
          initialPeriod="week"
        />
      </Animated.View>
    </ScrollView>
  );
};

export default UserStatisticsScreen;
