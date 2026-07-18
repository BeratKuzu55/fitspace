import FastImage from '@d11/react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loader from '../../../../components/Loader.tsx';
import { articleImages, PLACEHOLDER_IMAGE } from '../../../assets/imageMaps';
import { api } from '../../../services/api.ts';
import { useTheme } from '../../../theme/index.ts';
import useStyles from './styles.ts';

interface Article {
  id: number;
  title: string;
  title_en?: string;
  text: string;
  text_en?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type AllArticlesProps = Record<string, never>;

const AllArticles: React.FC<AllArticlesProps> = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/articles', {
          signal: abortController.current.signal,
          requiresAuth: true,
          validateStatus: s => s < 500,
        });

        if (!isMounted.current) return;

        if (response.data && Array.isArray(response.data)) {
          const activeArticles = response.data.filter(
            (article: Article) => article?.is_active === true,
          );
          setArticles(activeArticles);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('API Hatası:', error.response?.data);
        } else if (error instanceof Error) {
          console.error('Genel Hata:', error.message);
        } else {
          console.error('Beklenmedik Hata:', error);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchArticles();
  }, [navigation, t]);

  const renderArticle = useCallback(
    ({ item }: { item: Article }) => {
      const isEnglish = i18n.language === 'en';
      const articleTitle = isEnglish
        ? item.title_en || item.title
        : item.title || item.title_en;

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      return (
        <TouchableOpacity
          style={styles.cardContainer}
          activeOpacity={0.9}
          onPress={() => {
            navigation.navigate('Home', {
              screen: 'SingleArticle',
              params: {
                article: item,
              },
            });
          }}
        >
          <View style={styles.cardWrapper}>
            <FastImage
              source={articleImages[item.id] || PLACEHOLDER_IMAGE}
              style={styles.imageBackground}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View
              style={[
                styles.contentContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text style={styles.articleTitle} numberOfLines={2}>
                {articleTitle}
              </Text>
              {item.created_at && (
                <Text
                  style={[styles.date, { color: theme.colors.textSecondary }]}
                >
                  {formatDate(item.created_at)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      i18n.language,
      styles,
      theme.colors.surface,
      theme.colors.textSecondary,
      navigation,
    ],
  );

  if (loading) return <Loader />;

  return (
    <SafeAreaProvider style={styles.homeContainer}>
      <Text style={styles.title}>{t('singleArticle.title')}</Text>

      {articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.header}>{t('homeFront.exercises.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
        />
      )}
    </SafeAreaProvider>
  );
};

export default AllArticles;
