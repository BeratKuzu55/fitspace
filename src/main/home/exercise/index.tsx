import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/native';
import { getDownloadURL, ref } from 'firebase/storage';
import pLimit from 'p-limit';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { storage } from '../../../../firebaseConfig';
import { useAppSelector } from '../../../store';
import { useTheme } from '../../../theme';
import ExerciseLibraryCard from './exerciseLibraryCard';
import useStyles from './styles';

type ExerciseLibraryProps = Record<string, never>;

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const exercises = useAppSelector(state => state.exercise.exerciseLibrary);
  const exerciseId = (route.params as any)?.exerciseId;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exerciseImages, setExerciseImages] = useState<{
    [key: number]: string;
  }>({});

  const limit = pLimit(5);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const paginationRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch egzersiz resimleri
  const fetchExerciseImage = async (id: number) => {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
      try {
        const fileRef = ref(storage, `exercise-images/${id}.${ext}`);
        const url = await getDownloadURL(fileRef);
        setExerciseImages(prev => ({ ...prev, [id]: url }));
        return url;
      } catch (_) {
        continue;
      }
    }
    return '';
  };

  useEffect(() => {
    const loadImages = async () => {
      await Promise.all(
        exercises.map(ex => limit(() => fetchExerciseImage(ex.id))),
      );
    };
    loadImages();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    // Arama en az 2 karakter olmalı, yoksa tüm egzersizleri göster
    if (q.length < 2) {
      return exercises;
    }
    return exercises.filter(ex => {
      const originalName = (ex.name ?? '').toLowerCase();
      // Görüntülenen format: underscore'ları boşluklara çevir (örn: "bird_dog" -> "bird dog")
      const displayName = originalName.replace(/_/g, ' ');
      // Hem orijinal hem de görüntülenen formatta ara
      return originalName.includes(q) || displayName.includes(q);
    });
  }, [searchTerm, exercises]);

  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredExercises.slice(start, end);
  }, [filteredExercises, currentPage]);

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);

  // Arama terimi değiştiğinde sayfayı 1'e sıfırla
  useEffect(() => {
    setCurrentPage(1);
    // Liste başına scroll yap
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [searchTerm]);

  // Eğer mevcut sayfa toplam sayfa sayısından büyükse, son sayfaya git
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Scroll pagination to show current page when it changes
  useEffect(() => {
    if (paginationRef.current && totalPages > 0) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        // If we're near the end, scroll to end to show navigation buttons
        if (currentPage >= totalPages - 2) {
          paginationRef.current?.scrollToEnd({ animated: true });
        } else if (currentPage <= 3) {
          // If we're near the start, scroll to beginning
          paginationRef.current?.scrollTo({ x: 0, animated: true });
        }
      }, 100);
    }
  }, [currentPage, totalPages]);

  // Eğer route params'da exerciseId varsa, o egzersizi bul ve göster
  useEffect(() => {
    if (exerciseId && filteredExercises.length > 0) {
      const exerciseIndex = filteredExercises.findIndex(
        ex => ex.id === exerciseId,
      );
      if (exerciseIndex !== -1) {
        // Hangi sayfada olduğunu hesapla
        const targetPage = Math.floor(exerciseIndex / itemsPerPage) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        } else {
          // Zaten doğru sayfadaysa direkt scroll yap
          setTimeout(() => {
            if (flatListRef.current) {
              const indexInPage = exerciseIndex % itemsPerPage;
              flatListRef.current.scrollToIndex({
                index: indexInPage,
                animated: true,
                viewPosition: 0.5,
              });
            }
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, filteredExercises.length]); // exerciseId veya filteredExercises yüklendiğinde çalışsın

  // Sayfa değiştiğinde ve exerciseId varsa scroll yap
  useEffect(() => {
    if (
      exerciseId &&
      filteredExercises.length > 0 &&
      paginatedExercises.length > 0
    ) {
      const exerciseIndex = filteredExercises.findIndex(
        ex => ex.id === exerciseId,
      );
      if (exerciseIndex !== -1) {
        const targetPage = Math.floor(exerciseIndex / itemsPerPage) + 1;
        if (currentPage === targetPage) {
          // Doğru sayfadayız, scroll yap
          setTimeout(() => {
            if (flatListRef.current) {
              const indexInPage = exerciseIndex % itemsPerPage;
              const exerciseInCurrentPage = paginatedExercises.findIndex(
                ex => ex.id === exerciseId,
              );
              if (exerciseInCurrentPage !== -1) {
                flatListRef.current.scrollToIndex({
                  index: exerciseInCurrentPage,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
            }
          }, 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, paginatedExercises.length]); // Sayfa veya paginatedExercises değiştiğinde

  const openVideoModal = async (id: number) => {
    setLoading(true);
    try {
      const fileRef = ref(storage, `exercise-videos/${id}.mp4`);
      const videoUrl = await getDownloadURL(fileRef);
      setSelectedVideo(videoUrl);
    } catch (error) {
      console.error(error);
      setSelectedVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const closeVideoModal = () => setSelectedVideo(null);

  const renderExercise = ({ item, index }: any) => {
    const name = item.name
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return (
      <ExerciseLibraryCard
        key={item.id}
        stepNumber={index + 1 + (currentPage - 1) * itemsPerPage}
        image={
          exerciseImages[item.id] ? { uri: exerciseImages[item.id] } : undefined
        }
        title={name}
        time={{
          duration: item.duration,
          setcount: item.setcount,
          repetitions: item.repetitions,
        }}
        description={item.description}
        exercises={exercises}
        id={item.id}
        difficulty={item.difficulty}
        steps={item.steps}
        steps_en={item.steps_en}
      />
    );
  };

  // Best practice pagination with navigation buttons
  const renderPaginationButtons = () => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Calculate page numbers to show
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5; // Maximum number of page buttons to show

      if (totalPages <= maxVisible) {
        // Show all pages if total is less than maxVisible
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (currentPage <= 3) {
          // Near the start: show 1, 2, 3, 4, ..., last
          for (let i = 2; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('ellipsis');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Near the end: show 1, ..., last-3, last-2, last-1, last
          pages.push('ellipsis');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Middle: show 1, ..., current-1, current, current+1, ..., last
          pages.push('ellipsis');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('ellipsis');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
        // Scroll to top of list when page changes
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      }
    };

    return (
      <View style={styles.paginationContainer}>
        {/* First Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationNavButton,
            isFirstPage && styles.paginationNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(1)}
          disabled={isFirstPage}
        >
          <FontAwesomeIcon
            icon={faAnglesLeft as IconProp}
            size={16}
            color={
              isFirstPage ? theme.colors.border : theme.colors.textPrimary
            }
          />
        </TouchableOpacity>

        {/* Previous Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationNavButton,
            isFirstPage && styles.paginationNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          <FontAwesomeIcon
            icon={faAngleLeft as IconProp}
            size={16}
            color={
              isFirstPage ? theme.colors.border : theme.colors.textPrimary
            }
          />
        </TouchableOpacity>

        {/* Page Numbers */}
        <ScrollView
          ref={paginationRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paginationNumbersContainer}
        >
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <View
                  key={`ellipsis-${index}`}
                  style={styles.paginationEllipsis}
                >
                  <Text style={styles.paginationEllipsisText}>...</Text>
                </View>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <TouchableOpacity
                key={pageNum}
                style={[
                  styles.paginationNumberButton,
                  isActive && styles.paginationNumberButtonActive,
                ]}
                onPress={() => handlePageChange(pageNum)}
              >
                <Text
                  style={[
                    styles.paginationNumberText,
                    isActive && styles.paginationNumberTextActive,
                  ]}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Next Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationNavButton,
            isLastPage && styles.paginationNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          <FontAwesomeIcon
            icon={faAngleRight as IconProp}
            size={16}
            color={isLastPage ? theme.colors.border : theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Last Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationNavButton,
            isLastPage && styles.paginationNavButtonDisabled,
          ]}
          onPress={() => handlePageChange(totalPages)}
          disabled={isLastPage}
        >
          <FontAwesomeIcon
            icon={faAnglesRight as IconProp}
            size={16}
            color={isLastPage ? theme.colors.border : theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Arama Alanı */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <FontAwesomeIcon
            icon={faSearch as IconProp}
            size={16}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('exerciseLibrary.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* 🏋️‍♀️ Egzersiz Listesi */}
      <View style={{ flex: 1, paddingHorizontal: 30 }}>
        {filteredExercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('exerciseLibrary.emptyResults')}
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={paginatedExercises}
              keyExtractor={item => item.id.toString()}
              renderItem={renderExercise}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={21}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={info => {
                // Scroll başarısız olursa, biraz bekleyip tekrar dene
                setTimeout(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  }
                }, 100);
              }}
            />

            {/* Pagination */}
            {totalPages > 1 && renderPaginationButtons()}
          </>
        )}
      </View>

      {/* 🎥 Video Modal */}
      <Modal
        visible={!!selectedVideo}
        transparent
        animationType="fade"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <>
                {selectedVideo ? (
                  <Video
                    source={{ uri: selectedVideo }}
                    style={styles.video}
                    resizeMode="contain"
                    controls
                  />
                ) : (
                  <Text style={styles.emptyText}>
                    {t('exerciseLibrary.videoNotFound')}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeVideoModal}
                >
                  <Text style={styles.modalCloseText}>
                    {t('exerciseLibrary.closeButton')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExerciseLibrary;
