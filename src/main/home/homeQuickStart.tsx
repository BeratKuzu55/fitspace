import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import useStyles from './styles';

const HomeQuickStart = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const cards = [
    {
      title: t('homeFront.quickStart.home'),
      image: require('../../assets/card_images/at_home.png'),
      place: 'home',
    },
    {
      title: t('homeFront.quickStart.outdoor'),
      image: require('../../assets/card_images/at_outside.png'),
      place: 'outdoor',
    },
  ];

  const handleCardPress = (place: string) => {
    navigation.navigate('Home', {
      screen: 'QuickStart',
      params: { place },
    });
  };

  return (
    <View>
      <Text style={styles.header}>{t('homeFront.quickStart.title')}</Text>
      <View style={styles.quickStartCardContainer}>
        {cards.map((card, index) => (
          <Pressable
            key={index}
            onPress={() => handleCardPress(card.place)}
            style={({ pressed }) => [
              styles.quickStartCard,
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <FastImage
              source={card.image}
              style={styles.quickStartCardImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.quickStartOverlay}>
              <Text style={styles.quickStartCardText}>{card.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default memo(HomeQuickStart);
