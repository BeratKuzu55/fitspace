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

type HeightScreenProps = Record<string, never>;

const HeightScreen: React.FC<HeightScreenProps> = () => {
  const navigation = useNavigation();
  const [selectedHeight, setSelectedHeight] = useState(165);
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const handleNext = async () => {
    try {
      localStorage.set('profile_height', selectedHeight.toString());
      navigation.navigate('FitnessGoal');
    } catch (error) {
      console.error('Error saving height:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={4} totalSteps={9} />

      <Text style={styles.title}>{t('setup.height.title')}</Text>
      <Text style={styles.subtitle}>{t('setup.height.subtitle')}</Text>

      <View style={styles.heightValueContainer}>
        <Text style={styles.heightValue}>{selectedHeight}</Text>
        <Text style={styles.heightUnit}>{t('setup.height.unit')}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={120}
        maximumValue={230}
        step={1}
        value={selectedHeight}
        onValueChange={setSelectedHeight}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.onSurface}
        thumbTintColor={theme.colors.primary}
      />
      <RoundedButton text={t('setup.next')} onPress={handleNext} />
    </View>
  );
};

export default HeightScreen;
