import FastImage from '@d11/react-native-fast-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import useStyles from './styles.ts';

import { articleImages, PLACEHOLDER_IMAGE } from '../../assets/imageMaps';

interface Article {
  id: number;
  title: string;
  title_en?: string;
  text: string;
  text_en?: string;
  created_at: string;
}

interface ArticleSectionProps {
  articles: Article[];
}

const HomeArticles = ({ articles }: ArticleSectionProps) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [shuffledArticles, setShuffledArticles] = useState<Article[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (articles && articles.length > 0) {
        const shuffled = [...articles].sort(() => 0.5 - Math.random());
        setShuffledArticles(shuffled.slice(0, 5));
      } else {
        setShuffledArticles([]);
      }
    }, [articles]),
  );

  return (
    <View>
      <View style={styles.exerciseHeader}>
        <Text style={styles.header}>{t('homeFront.articles')}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Home', { screen: 'AllArticlesFront' })
          }
          style={styles.exerciseHeader}
        >
          <Text style={styles.exerciseAll}>
            {t('homeFront.articlesViewAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardContainer}
      >
        {shuffledArticles.map((item, index) => {
          const currentLanguage = i18n.language || 'tr';
          const isEnglish = currentLanguage === 'en';
          const articleTitle = isEnglish
            ? item.title_en || item.title
            : item.title || item.title_en;

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={styles.seninGozundenCard}
              onPress={() => {
                navigation.navigate('Home', {
                  screen: 'SingleArticle',
                  params: {
                    article: item,
                  },
                });
              }}
            >
              <FastImage
                source={articleImages[item.id] || PLACEHOLDER_IMAGE}
                style={styles.seninGozundenImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.seninGozundenText}>{articleTitle}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default React.memo(HomeArticles);
