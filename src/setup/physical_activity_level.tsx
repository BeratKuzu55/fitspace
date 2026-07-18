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

type PhysicalActivityLevelScreenProps = Record<string, never>;

const PhysicalActivityLevelScreen: React.FC<PhysicalActivityLevelScreenProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const options = ['beginner', 'intermediate', 'advanced'];

  const optionText = {
    beginner: 'activityLevel.options.beginner',
    intermediate: 'activityLevel.options.intermediate',
    advanced: 'activityLevel.options.advanced',
  };

  const [selected, setSelected] = useState<string | null>('beginner');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSelectActivityLevel = async () => {
    if (!selected) {
      Alert.alert(t('exerciseExperience.notifications.missingSelection'));
      return;
    }
    setLoading(true);

    try {
      localStorage.set('profile_activity_level', selected);
    } catch (error) {
      console.error('Error saving activity level:', error);
    } finally {
      if (isMounted.current) setLoading(false);
      navigation.navigate('HealthProblems');
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={7} totalSteps={9} />
      <Text style={styles.title}>{t('setup.physicalActivityLevel')}</Text>
      <View style={styles.segmentedGroup}>
        {options.map(option => (
          <SegmentedRadioButton
            key={option}
            title={t(optionText[option as keyof typeof optionText])}
            selected={selected === option}
            onPress={() => setSelected(option)}
          />
        ))}
      </View>
      <RoundedButton
        text={t('setup.next')}
        onPress={handleSelectActivityLevel}
        loading={loading}
      />
    </View>
  );
};

export default PhysicalActivityLevelScreen;
