import FastImage from '@d11/react-native-fast-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { exerciseImages, PLACEHOLDER_IMAGE } from '../../assets/imageMaps';
import { useAppSelector } from '../../store';
import { useTheme } from '../../theme';
import { HomeStackParamList } from '../../types/navigation';
import useStyles from './styles.ts';

// 1. Egzersiz Tipi Tanımı
interface Exercise {
  id: string | number;
  name: string;
}

const HomeExercises = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  // 2. Navigasyon Tiplemesi
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const exerciseLibrary = useAppSelector(
    state => state.exercise.exerciseLibrary as Exercise[],
  );

  const [randomExercises, setRandomExercises] = useState<Exercise[]>([]);

  // 3. Veri Karıştırma Mantığı (Memoize edilmiş)
  useFocusEffect(
    useCallback(() => {
      if (exerciseLibrary && exerciseLibrary.length > 0) {
        const shuffled = [...exerciseLibrary]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        setRandomExercises(shuffled);
      }
    }, [exerciseLibrary]),
  );

  // 4. İsim Formatlama Yardımcısı
  const formatExerciseName = (name: string) => {
    if (!name) return '';
    return name
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  if (randomExercises.length < 1) {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.header}>{t('homeFront.exercises.title')}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          {t('homeFront.exercises.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.exerciseHeader}>
        <Text style={styles.header}>{t('homeFront.exercises.title')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ExerciseLibraryFront', {})}
          style={styles.exerciseHeader}
        >
          <Text style={styles.exerciseAll}>
            {t('homeFront.exercises.viewAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardContainer}
        decelerationRate="fast"
        snapToInterval={200}
      >
        {randomExercises.map((item, index) => {
          const imageKey = item.id as keyof typeof exerciseImages;
          const source = exerciseImages[imageKey] || PLACEHOLDER_IMAGE;

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={styles.exerciseCardImage}
              onPress={() =>
                navigation.navigate('ExerciseLibraryFront', {
                  exerciseId: Number(item.id),
                })
              }
            >
              <FastImage
                source={source}
                style={styles.exerciseImageFixed}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.seninGozundenText}>
                {formatExerciseName(item.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default React.memo(HomeExercises);
