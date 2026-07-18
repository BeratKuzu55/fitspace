import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RadioButton from '../../components/RadioButton';
import { api } from '../services/api';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';
import { useAppDispatch } from '../store';
import { setToken } from '../store/slices/authSlice';
import RoundedButton from '../../components/RoundedButton';

interface Disease {
  is_injury: boolean;
  name: string;
  description: string;
  id: number;
  display_name?: string;
}

type HealthProblemsScreenProps = Record<string, never>;

const HealthProblemsScreen: React.FC<HealthProblemsScreenProps> = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const [healthDiseases, setHealthDiseases] = useState<Disease[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const getDisplayName = useCallback(
    (diseaseName: string) => {
      return t(`setup.diseases.${diseaseName}`, diseaseName);
    },
    [t],
  );

  const handleUnauthorized = useCallback(() => {
    showNotification(
      t('setup.healthProblems.notifications.errorTitle'),
      t('setup.healthProblems.notifications.authFailed'),
      'danger',
    );
    localStorage.remove('authToken');
    dispatch(setToken(null));
  }, [dispatch, t]);

  useEffect(() => {
    const fetchHealthProblems = async () => {
      try {
        const res = await api.get('/api/diseases', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (res.status === 200 && Array.isArray(res.data)) {
          const enriched = res.data
            .filter((d: Disease) => !d.is_injury)
            .map((d: Disease) => ({
              ...d,
              display_name: getDisplayName(d.name),
            }));
          setHealthDiseases(enriched);
        }
      } catch (error) {
        showNotification(
          t('setup.healthProblems.notifications.errorTitle'),
          t('setup.healthProblems.notifications.loadFailed'),
          'danger',
        );
        console.log(error);
      }
    };

    fetchHealthProblems();
  }, [getDisplayName, handleUnauthorized, t]);

  const toggleSelection = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  };

  const handleNext = () => {
    try {
      const healthProblemIds = healthDiseases
        .filter(d => selectedKeys.includes(d.id.toString()))
        .map(d => d.id);

      localStorage.set(
        'profile_health_problems',
        JSON.stringify(healthProblemIds),
      );

      navigation.navigate('Injuries');
    } catch (error) {
      console.error('Error saving health problems:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ProgressIndicator step={8} totalSteps={9} />
        <Text style={styles.title}>{t('setup.healthProblems.title')}</Text>
        <View style={styles.radioGroup}>
          {healthDiseases.map(disease => (
            <RadioButton
              key={disease.id}
              title={disease.display_name || disease.name}
              selected={selectedKeys.includes(disease.id.toString())}
              onPress={() => toggleSelection(disease.id.toString())}
            />
          ))}
        </View>
        <RoundedButton text={t('setup.next')} onPress={handleNext} />
      </View>
    </ScrollView>
  );
};

export default HealthProblemsScreen;
