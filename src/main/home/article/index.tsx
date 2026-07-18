import { useNavigation } from '@react-navigation/native';
import type React from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import FastImage from '@d11/react-native-fast-image';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../../../../firebaseConfig';
import { showNotification } from '../../../utils/notificationHelper';

import Loader from '../../../../components/Loader';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import useStyles from './styles';

type Props = Record<string, never>;

interface Article {
  id: string;
  title: string;
  text: string;
  image_url: string;
}

interface ArticleApi {
  id: string | number;
  title?: unknown;
  text?: unknown;
}

const Articles: React.FC<Props> = () => {
  const navigation = useNavigation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme } = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/articles', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        });

        if (response.status === 401) {
          showNotification(
            'Oturum gerekli',
            'Lütfen tekrar giriş yapın.',
            'warning',
          );
          return;
        }

        if (response.status !== 200 || !Array.isArray(response.data)) {
          showNotification('Makale bulunamadı', 'Geri dönülüyor.', 'danger');
          return;
        }

        const fetchedArticles: Article[] = (response.data as ArticleApi[]).map(
          article => ({
            id: String(article.id),
            title: String(article.title ?? ''),
            text: String(article.text ?? ''),
            image_url: '',
          }),
        );

        const articlesWithImages = await Promise.all(
          fetchedArticles.map(async (article: Article) => {
            try {
              const storageRef = ref(storage, `article-images/${article.id}`);
              const url = await getDownloadURL(storageRef);
              return { ...article, image_url: url };
            } catch {
              return {
                ...article,
                image_url: 'https://via.placeholder.com/200',
              };
            }
          }),
        );

        setArticles(articlesWithImages);
      } catch {
        showNotification(
          'Sunucu hatası',
          'Lütfen daha sonra tekrar deneyin.',
          'danger',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const handleNavigate = (article: Article) => {
    navigation.navigate('Details', { id: article.id });
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => handleNavigate(item)}
    >
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: item.image_url || 'https://via.placeholder.com/150',
          }}
          style={styles.articleImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.summary}>{item.text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default Articles;
