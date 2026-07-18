import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RoundedButton from '../../components/RoundedButton';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import useStyles from './styles';

type WeightScreenProps = Record<string, never>;

const WeightScreen: React.FC<WeightScreenProps> = () => {
  const navigation = useNavigation();
  const [selectedWeight, setSelectedWeight] = useState(60); // Default to 60 kg
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const handleNext = async () => {
    try {
      localStorage.set('profile_weight', selectedWeight.toString());

      navigation.navigate('Height');
    } catch (error) {
      console.error('Error saving weight:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={3} totalSteps={9} />

      <Text style={styles.title}>{t('setup.weight.title')}</Text>
      <Text style={styles.subtitle}>{t('setup.weight.subtitle')}</Text>

      <View style={styles.heightValueContainer}>
        <Text style={styles.heightValue}>{selectedWeight}</Text>
        <Text style={styles.heightUnit}>{t('setup.weight.unit')}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={30}
        maximumValue={200}
        step={1}
        value={selectedWeight}
        onValueChange={setSelectedWeight}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
      />
      <RoundedButton text={t('setup.next')} onPress={handleNext} />
    </View>
  );
};

export default WeightScreen;
