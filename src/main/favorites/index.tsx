import { useIsFocused } from '@react-navigation/native';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Loader from '../../../components/Loader';
import { storage } from '../../../firebaseConfig';
import { primitives } from '../../../styles/colors';
import useGlobalStyles from '../../../styles/styles';
import { useTheme } from '../../theme';
const { width, height } = Dimensions.get('window');

interface SocialVideo {
  id: string;
  url: string;
  name: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

type FavoritesScreenProps = Record<string, never>;

const FavoritesScreen: React.FC<FavoritesScreenProps> = () => {
  const { theme } = useTheme();
  const styles = useGlobalStyles(theme);
  const globalStyles = useGlobalStyles(theme);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [videos, setVideos] = useState<SocialVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [pausedVideos, setPausedVideos] = useState<{ [key: string]: boolean }>(
    {},
  );
  const flatListRef = useRef<FlatList>(null);

  // Header yüksekliği (minHeight: 64 + safe area top)
  const headerHeight = 64 + insets.top;
  // Footer yüksekliği (padding 8*2 + border 1 + icon ~40px + safe area bottom)
  const footerHeight = 16 + 1 + 40 + insets.bottom;
  // Video container yüksekliği (tam ekran - header - footer)
  const screenHeight = height - headerHeight - footerHeight;

  // Firebase'den social-videos klasöründeki videoları çek
  useEffect(() => {
    const fetchSocialVideos = async () => {
      try {
        setLoading(true);
        const folderRef = ref(storage, 'social-videos');
        const listResult = await listAll(folderRef);

        // Tüm videoları paralel olarak yükle
        const videoPromises = listResult.items.map(async item => {
          try {
            const url = await getDownloadURL(item);
            return {
              id: item.name,
              url: url,
              name: item.name,
            };
          } catch (error) {
            console.error(`Video URL alma hatası (${item.name}):`, error);
            return null;
          }
        });

        const videoResults = await Promise.all(videoPromises);
        const validVideos = videoResults.filter(
          (video): video is SocialVideo => video !== null,
        );

        const shuffledVideos = shuffleArray(validVideos);

        setVideos(shuffledVideos);

        // İlk videoyu otomatik oynat
        if (shuffledVideos.length > 0) {
          setPausedVideos({ [shuffledVideos[0].id]: false });
        }
      } catch (error) {
        console.error('Social videos yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialVideos();
  }, []);

  // Görünür video değiştiğinde oynat/durdur
  const onViewableItemsChangedCallback = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && videos.length > 0) {
        const visibleIndex = viewableItems[0].index;
        if (visibleIndex !== null && visibleIndex !== currentVideoIndex) {
          // Önceki videoyu durdur
          const previousVideo = videos[currentVideoIndex];
          if (previousVideo) {
            setPausedVideos(prev => ({ ...prev, [previousVideo.id]: true }));
          }

          // Yeni videoyu oynat
          setCurrentVideoIndex(visibleIndex);
          const currentVideo = videos[visibleIndex];
          if (currentVideo) {
            setPausedVideos(prev => ({ ...prev, [currentVideo.id]: false }));
          }
        }
      }
    },
    [videos, currentVideoIndex],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Video render fonksiyonu
  const renderVideo = ({
    item,
    index,
  }: {
    item: SocialVideo;
    index: number;
  }) => {
    const isCurrentVideo = index === currentVideoIndex;
    const isPaused =
      !isFocused ||
      (pausedVideos[item.id] !== undefined
        ? pausedVideos[item.id]
        : !isCurrentVideo);

    return (
      <View style={[videoStyles.videoContainer, { height: screenHeight }]}>
        <Video
          source={{ uri: item.url }}
          style={videoStyles.video}
          resizeMode="contain"
          paused={isPaused}
          repeat={true}
          muted={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoad={() => {
            // Video yüklendiğinde, eğer bu görünür video ise oynat
            if (isCurrentVideo) {
              setPausedVideos(prev => ({ ...prev, [item.id]: false }));
            }
          }}
          onError={error => {
            console.error(`Video oynatma hatası (${item.name}):`, error);
          }}
        />
      </View>
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (videos.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text
          style={[
            globalStyles.header,
            globalStyles.titleFont,
            { textAlign: 'center' },
          ]}
        >
          Henüz video bulunmamaktadır
        </Text>
      </View>
    );
  }

  return (
    <View style={videoStyles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderVideo}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChangedCallback}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />
    </View>
  );
};

export default FavoritesScreen;

// Video styles should be moved to a separate styles.ts file per project rules
// For now, using primitives for hardcoded colors
const videoStyles = StyleSheet.create({
  container: {
    backgroundColor: primitives.black,
    flex: 1,
  },
  video: {
    height: '100%',
    width: '100%',
  },
  videoContainer: {
    alignItems: 'center',
    backgroundColor: primitives.black,
    justifyContent: 'flex-start',
    width: width,
  },
});
