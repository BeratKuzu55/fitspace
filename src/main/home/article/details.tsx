import { useRoute } from '@react-navigation/native';
import type React from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import FastImage from '@d11/react-native-fast-image';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { storage } from '../../../../firebaseConfig';
import { showNotification } from '../../../utils/notificationHelper';

import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import useStyles from './styles';

interface RouteParams {
  id: string;
}

const Details: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as RouteParams;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/article', {
          params: { id },
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

        if (response.status !== 200 || !response.data) {
          showNotification('Makale bulunamadı', 'Lütfen geri dönün.', 'danger');
          return;
        }

        let articleTemp = response.data;
        try {
          const storageRef = ref(storage, `article-images/${articleTemp.id}`);
          const url = await getDownloadURL(storageRef);
          articleTemp = { ...articleTemp, image_url: url };
        } catch {
          articleTemp = {
            ...articleTemp,
            image_url: 'https://via.placeholder.com/200',
          };
        }

        setArticle(articleTemp);
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

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Makale yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.detailcontainer}>
      <Text style={styles.detailtitle}>{article.title}</Text>
      <Text style={styles.detaildate}>
        Yayınlanma Tarihi: {article.created_at}
      </Text>
      <FastImage
        source={{
          uri: article.image_url
            ? article.image_url
            : 'https://via.placeholder.com/150',
        }}
        style={styles.articleImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.content}>{article.text}</Text>
    </ScrollView>
  );
};

export default Details;
