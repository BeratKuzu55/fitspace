import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import RadioButton from '../../../components/RadioButton';
import RoundedButton from '../../../components/RoundedButton';
import { api } from '../../services/api';
import { useAppDispatch } from '../../store';
import { setToken } from '../../store/slices/authSlice';
import { useTheme } from '../../theme';
import { localStorage } from '../../utils/localStorage';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

const GOAL_MAP = [
  { key: 'lose_weight', label: 'exerciseGoal.options.loseWeight' },
  { key: 'toning', label: 'exerciseGoal.options.toning' },
  { key: 'strength', label: 'exerciseGoal.options.strength' },
  { key: 'flexibility', label: 'exerciseGoal.options.flexibility' },
] as const;

type GoalKey = (typeof GOAL_MAP)[number]['key'];

type ExerciseGoalProps = Record<string, never>;

const ExerciseGoal: React.FC<ExerciseGoalProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMounted = useRef(true);

  const [selectedKeys, setSelectedKeys] = useState<GoalKey[]>([]);
  const [loading, setLoading] = useState(false);

  // Merkezi Yetki Hatası Yönetimi
  const handleUnauthorized = useCallback(() => {
    showNotification(
      t('exerciseGoal.notifications.errorTitle'),
      t('exerciseGoal.notifications.authFailed'),
      'danger',
    );
    localStorage.remove('authToken');
    dispatch(setToken(null));
  }, [dispatch, t]);

  // Seçim değiştirme mantığı
  const toggleSelection = (key: GoalKey) => {
    setSelectedKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(item => item !== key);
      }
      if (prev.length >= 3) {
        Alert.alert(t('exerciseGoal.notifications.maxSelection'));
        return prev;
      }
      return [...prev, key];
    });
  };

  // Veri Çekme
  const fetchExerciseGoals = useCallback(async () => {
    try {
      const response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (!isMounted.current) return;

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 200 && response.data?.user) {
        const goalsFromApi = response.data.user.fitness_goals || {};
        // API'den gelen boolean objesini bizim listemize (selectedKeys) çeviriyoruz
        const initialSelected = GOAL_MAP.filter(
          item => goalsFromApi[item.key] === true,
        ).map(item => item.key as GoalKey);

        setSelectedKeys(initialSelected);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('exerciseGoal.notifications.errorTitle'),
        t('exerciseGoal.notifications.generic'),
        'danger',
      );
    }
  }, [handleUnauthorized, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchExerciseGoals();
    return () => {
      isMounted.current = false;
    };
  }, [fetchExerciseGoals]);

  // Kaydetme İşlemi
  const handleSubmit = async () => {
    if (selectedKeys.length === 0) {
      Alert.alert(t('exerciseGoal.notifications.missingSelection'));
      return;
    }

    // Seçilen anahtarları tekrar boolean objesine çeviriyoruz
    const fitness_goals = GOAL_MAP.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.key]: selectedKeys.includes(curr.key as GoalKey),
      }),
      {},
    );

    setLoading(true);
    try {
      const response = await api.post(
        '/api/user',
        { fitness_goals },
        {
          requiresAuth: true,
          validateStatus: s => s < 500,
        },
      );

      if (response.status >= 200 && response.status < 300) {
        showNotification(
          t('exerciseGoal.notifications.updateSuccessTitle'),
          t('exerciseGoal.notifications.updateSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          t('exerciseGoal.notifications.errorTitle'),
          t('exerciseGoal.notifications.updateFailed'),
          'danger',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('exerciseGoal.notifications.errorTitle'),
        t('exerciseGoal.notifications.updateError'),
        'danger',
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('exerciseGoal.title')}</Text>
      <Text style={styles.subtitle}>{t('exerciseGoal.subtitle')}</Text>

      <View style={styles.radioGroup}>
        {GOAL_MAP.map(option => (
          <RadioButton
            key={option.key}
            title={t(option.label)}
            selected={selectedKeys.includes(option.key as GoalKey)}
            onPress={() => toggleSelection(option.key as GoalKey)}
          />
        ))}
      </View>
      <RoundedButton
        text={t('exerciseGoal.buttons.confirm')}
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
};

export default ExerciseGoal;
