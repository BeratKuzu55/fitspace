import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RadioButton from '../../components/RadioButton';
import RoundedButton from '../../components/RoundedButton';
import { api } from '../services/api';
import { useAppDispatch } from '../store';
import { setSetupNeeded, setToken } from '../store/slices/authSlice';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';

interface Disease {
  is_injury: boolean;
  name: string;
  description: string;
  id: number;
  display_name?: string;
}

type InjuriesScreenProps = Record<string, never>;

const InjuriesScreen: React.FC<InjuriesScreenProps> = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const isMounted = useRef(true);

  const [injuryDiseases, setInjuryDiseases] = useState<Disease[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDisplayName = useCallback(
    (name: string) => {
      return t(`setup.diseases.${name}`, name);
    },
    [t],
  );

  // Yetki hatası yönetimi
  const handleUnauthorized = useCallback(() => {
    showNotification(
      t('setup.injuries.notifications.errorTitle'),
      t('setup.injuries.notifications.authFailed'),
      'danger',
    );
    localStorage.remove('authToken');
    localStorage.remove('user_profile');
    dispatch(setToken(null));
  }, [dispatch, t]);

  useEffect(() => {
    isMounted.current = true;
    const fetchHealthProblems = async () => {
      try {
        const res = await api.get('/api/diseases', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        });

        if (!isMounted.current) return;

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (res.status === 200 && Array.isArray(res.data)) {
          const enrichedDiseases: Disease[] = res.data.map((d: Disease) => ({
            ...d,
            display_name: getDisplayName(d.name),
          }));

          setInjuryDiseases(enrichedDiseases.filter(d => d.is_injury === true));
        }
      } catch (error) {
        showNotification(
          t('setup.injuries.notifications.errorTitle'),
          t('setup.injuries.notifications.loadFailed'),
          'danger',
        );
        console.log(error);
      }
    };

    fetchHealthProblems();
    return () => {
      isMounted.current = false;
    };
  }, [getDisplayName, handleUnauthorized, t]);

  const toggleSelection = (key: string) => {
    setSelectedOptions(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  };

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // LocalStorage'dan toplanan veriler
      const [gender, age, weight, height, goal, exp, level, healthProblems] =
        await Promise.all([
          localStorage.getString('profile_gender'),
          localStorage.getString('profile_age'),
          localStorage.getString('profile_weight'),
          localStorage.getString('profile_height'),
          localStorage.getString('profile_fitness_goal'),
          localStorage.getString('profile_experience'),
          localStorage.getString('profile_activity_level'),
          localStorage.getString('profile_health_problems'),
        ]);

      const diseaseIds = [
        ...selectedOptions.map(id => Number(id)),
        ...(healthProblems ? JSON.parse(healthProblems) : []),
      ].filter(n => Number.isFinite(n));

      const profileData = {
        gender,
        age: age ? parseInt(age, 10) : null,
        weight: weight ? parseInt(weight, 10) : null,
        height: height ? parseInt(height, 10) : null,
        fitness_goals: goal ? JSON.parse(goal) : [],
        exercise_exp: exp,
        activity_level: level,
        diseases: diseaseIds,
      };

      const res = await api.post('/api/user', profileData, {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (res.status >= 200 && res.status < 300) {
        // 1. Profil bilgisini kaydet
        localStorage.set(
          'user_profile',
          JSON.stringify(res.data.user || res.data),
        );

        showNotification(
          t('setup.injuries.notifications.successTitle'),
          t('setup.injuries.notifications.successMessage'),
          'success',
        );

        // 2. KRİTİK: Redux state'ini güncelle
        // App.tsx bu değişikliği gördüğü an otomatik olarak Main yığınına geçer.
        dispatch(setSetupNeeded(false));
      } else if (res.status === 401) {
        handleUnauthorized();
      } else {
        showNotification(
          t('setup.injuries.notifications.failTitle'),
          t('setup.injuries.notifications.failMessage'),
          'warning',
        );
      }
    } catch (error) {
      showNotification(
        t('setup.injuries.notifications.errorTitle'),
        t('setup.injuries.notifications.generic'),
        'danger',
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ProgressIndicator step={9} totalSteps={9} />
        <Text style={styles.title}>{t('setup.injuries.title')}</Text>

        <View style={styles.radioGroup}>
          {injuryDiseases.map(option => (
            <RadioButton
              key={option.id}
              title={option.display_name || option.name}
              selected={selectedOptions.includes(option.id.toString())}
              onPress={() => toggleSelection(option.id.toString())}
            />
          ))}
        </View>
        <RoundedButton
          text={isLoading ? t('setup.loading') : t('setup.next')}
          onPress={handleNext}
          loading={isLoading}
        />
      </View>
    </ScrollView>
  );
};

export default InjuriesScreen;
