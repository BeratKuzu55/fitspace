import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RadioButton from '../../components/RadioButton';
import RoundedButton from '../../components/RoundedButton';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import { showNotification } from '../utils/notificationHelper';
import useStyles from './styles';

type FitnessGoals = {
  lose_weight: boolean;
  toning: boolean;
  strength: boolean;
  flexibility: boolean;
};

type FitnessGoalScreenProps = Record<string, never>;

const FitnessGoalScreen: React.FC<FitnessGoalScreenProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const [selectedGoals, setSelectedGoals] = useState<FitnessGoals>({
    lose_weight: false,
    toning: false,
    strength: false,
    flexibility: false,
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const countSelectedGoals = () => {
    return Object.values(selectedGoals).filter(value => value).length;
  };

  const handleToggle = (goalKey: keyof FitnessGoals) => {
    const count = countSelectedGoals();
    if (selectedGoals[goalKey]) {
      setSelectedGoals(prev => ({ ...prev, [goalKey]: false }));
    } else if (count < 3) {
      setSelectedGoals(prev => ({ ...prev, [goalKey]: true }));
    } else {
      showNotification(
        t('setup.fitnessGoal.warningTitle'),
        t('setup.fitnessGoal.maxSelection'),
        'warning',
      );
    }
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      localStorage.set('profile_fitness_goal', JSON.stringify(selectedGoals));
    } catch (error) {
      console.error('Error saving fitness goals:', error);
    } finally {
      if (isMounted.current) setLoading(false);
      navigation.navigate('Experience');
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={5} totalSteps={9} />
      <Text style={styles.title}>{t('setup.fitnessGoal.title')}</Text>
      <View style={styles.radioGroup}>
        <RadioButton
          title={t('setup.fitnessGoal.options.loseWeight')}
          selected={selectedGoals.lose_weight}
          onPress={() => handleToggle('lose_weight')}
        />
        <RadioButton
          title={t('setup.fitnessGoal.options.toning')}
          selected={selectedGoals.toning}
          onPress={() => handleToggle('toning')}
        />
        <RadioButton
          title={t('setup.fitnessGoal.options.strength')}
          selected={selectedGoals.strength}
          onPress={() => handleToggle('strength')}
        />
        <RadioButton
          title={t('setup.fitnessGoal.options.flexibility')}
          selected={selectedGoals.flexibility}
          onPress={() => handleToggle('flexibility')}
        />
      </View>
      <RoundedButton
        text={t('setup.next')}
        onPress={handleNext}
        loading={loading}
      />
    </View>
  );
};

export default FitnessGoalScreen;
