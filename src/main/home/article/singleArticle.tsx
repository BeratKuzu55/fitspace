import { useRoute } from '@react-navigation/native';
import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from '@d11/react-native-fast-image';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../../../theme';
import useStyles from './styles';
import { articleImages, PLACEHOLDER_IMAGE } from '../../../assets/imageMaps';

const { width } = Dimensions.get('window');

interface Article {
  id: number;
  title: string;
  title_en?: string;
  text: string;
  text_en?: string;
  created_at: string;
}

type SingleArticleProps = Record<string, never>;

const SingleArticle: React.FC<SingleArticleProps> = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const route = useRoute();

  const { article } = route.params as { article: Article };

  if (!article) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('singleArticle.notFound')}</Text>
      </View>
    );
  }

  const currentLanguage = i18n.language || 'tr';
  const isEnglish = currentLanguage === 'en';

  const articleTitle = isEnglish
    ? article.title_en || article.title
    : article.title || article.title_en;

  const articleText = isEnglish
    ? article.text_en || article.text
    : article.text || article.text_en;

  return (
    <ScrollView
      style={styles.detailcontainer}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
    >
      <FastImage
        source={articleImages[article.id] || PLACEHOLDER_IMAGE}
        style={[
          styles.detailarticleImage,
          { width: width, height: width * 0.6 },
        ]}
        resizeMode={FastImage.resizeMode.cover}
      />

      <View style={styles.detailtextContainer}>
        <Text style={styles.detailtitle}>{articleTitle}</Text>
        <Text style={styles.detaildate}>
          {t('singleArticle.publicationDate')}
          {new Date(article.created_at).toLocaleDateString(
            isEnglish ? 'en-US' : 'tr-TR',
          )}
        </Text>

        <Markdown
          style={{
            body: styles.detailcontent,
            link: { color: theme.colors.primary },
            image: { width: width - 32 },
          }}
        >
          {articleText || ''}
        </Markdown>
      </View>
    </ScrollView>
  );
};

export default SingleArticle;
