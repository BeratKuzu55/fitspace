import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RoundedButton from '../../components/RoundedButton';
import SegmentedRadioButton from '../../components/SegmentedRadioButton';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import useStyles from './styles';

type ExpLevel = 'beginner' | 'intermediate' | 'advanced';

const EXP_MAPPING: { value: ExpLevel; label: string }[] = [
  { value: 'beginner', label: 'exerciseExperience.options.beginner' },
  { value: 'intermediate', label: 'exerciseExperience.options.intermediate' },
  { value: 'advanced', label: 'exerciseExperience.options.advanced' },
];

type ExperienceScreenProps = Record<string, never>;

const ExperienceScreen: React.FC<ExperienceScreenProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const [selected, setSelected] = useState<string | null>('beginner');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSelectExperience = async () => {
    if (!selected) {
      Alert.alert(t('exerciseExperience.notifications.missingSelection'));
      return;
    }
    setLoading(true);

    let transformedSelected = selected;

    if (selected === t('setup.experience.options.intermediate')) {
      transformedSelected = 'intermediate';
    } else if (selected === t('setup.experience.options.advanced')) {
      transformedSelected = 'advanced';
    }

    if (!transformedSelected) {
      setLoading(false);
      return Alert.alert(
        t('exerciseExperience.notifications.missingSelection'),
      );
    } else {
      try {
        localStorage.set('profile_experience', transformedSelected);
      } catch (error) {
        console.error('Error saving experience:', error);
      } finally {
        if (isMounted.current) setLoading(false);
        navigation.navigate('PhysicalActivityLevel');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={6} totalSteps={9} />
      <Text style={styles.title}>{t('setup.experience.title')}</Text>
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
        text={t('setup.next')}
        onPress={handleSelectExperience}
        loading={loading}
      />
    </View>
  );
};

export default ExperienceScreen;
