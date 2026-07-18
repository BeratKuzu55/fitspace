import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import SegmentedRadioButton from '../../../components/SegmentedRadioButton';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import RoundedButton from '../../../components/RoundedButton';

type ExpLevel = 'beginner' | 'intermediate' | 'advanced';

const EXP_MAPPING: { value: ExpLevel; label: string }[] = [
  { value: 'beginner', label: 'exerciseExperience.options.beginner' },
  { value: 'intermediate', label: 'exerciseExperience.options.intermediate' },
  { value: 'advanced', label: 'exerciseExperience.options.advanced' },
];

type ExerciseExperienceProps = Record<string, never>;

const ExerciseExperience: React.FC<ExerciseExperienceProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const isMounted = useRef(true);
  const [selected, setSelected] = useState<ExpLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExperienceLevel = useCallback(async () => {
    try {
      const response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (!isMounted.current) return;

      if (response.status === 200 && response.data?.user) {
        const levelFromApi = response.data.user.exercise_exp as ExpLevel;
        if (EXP_MAPPING.some(opt => opt.value === levelFromApi)) {
          setSelected(levelFromApi);
        }
      } else {
        showNotification(
          t('exerciseExperience.notifications.errorTitle'),
          t('exerciseExperience.notifications.infoFetchFailed'),
          'danger',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('exerciseExperience.notifications.errorTitle'),
        t('exerciseExperience.notifications.generic'),
        'danger',
      );
    }
  }, [t]);

  useEffect(() => {
    isMounted.current = true;
    fetchExperienceLevel();
    return () => {
      isMounted.current = false;
    };
  }, [fetchExperienceLevel]);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert(t('exerciseExperience.notifications.missingSelection'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        '/api/user',
        { exercise_exp: selected },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );

      if (response.status >= 200 && response.status < 300) {
        showNotification(
          t('exerciseExperience.notifications.updateSuccessTitle'),
          t('exerciseExperience.notifications.updateSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          t('exerciseExperience.notifications.errorTitle'),
          t('exerciseExperience.notifications.updateFailed'),
          'danger',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('exerciseExperience.notifications.errorTitle'),
        t('exerciseExperience.notifications.updateError'),
        'danger',
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('exerciseExperience.title')}</Text>
      <View style={styles.segmentedGroup}>
        {EXP_MAPPING.map(option => (
          <SegmentedRadioButton
            key={option.value}
            title={t(option.label)}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
          />
        ))}
      </View>
      <RoundedButton
        text={t('exerciseExperience.buttons.confirm')}
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
};

export default ExerciseExperience;
