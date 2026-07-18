import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import i18n from '../../../locales/i18n';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import { showNotification } from '../../../utils/notificationHelper';
import useStyles from './style';

type AiAnalyseProps = Record<string, never>;

const AiAnalyse: React.FC<AiAnalyseProps> = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [analysis, setAnalysis] = useState<{
    tr: string | null;
    en: string | null;
  }>({ tr: null, en: null });
  const [loading, setLoading] = useState(false);

  // BELLEK YÖNETİMİ İÇİN REFLER
  const isMounted = useRef(true);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef(new AbortController());
  const retryCount = useRef(0);
  const maxRetries = 20;

  const isEnglish = i18n.language === 'en';

  const stopPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopPolling();

      controller.abort();
    };
  }, [stopPolling]);

  const fetchExistingAnalysis = async () => {
    try {
      const response = await api.get('/api/user/analyze', {
        requiresAuth: true,
        signal: abortController.current.signal,
      });

      if (
        isMounted.current &&
        response.status === 200 &&
        response.data?.analysis
      ) {
        setAnalysis({
          tr: response.data.analysis.tr || null,
          en: response.data.analysis.en || null,
        });
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;

      if (isMounted.current) {
        console.log('No existing analysis found or fetch failed');
      }
    }
  };
  useEffect(() => {
    fetchExistingAnalysis();
  }, []);

  const startPolling = useCallback(() => {
    stopPolling(); // Varsa eski timer'ı temizle
    retryCount.current = 0;

    pollingTimer.current = setInterval(async () => {
      if (!isMounted.current) return;

      retryCount.current += 1;

      try {
        const response = await api.get('/api/user/analyze', {
          requiresAuth: true,
          signal: abortController.current.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!isMounted.current) return;

        if (response.status === 200 && response.data?.analysis?.tr) {
          setAnalysis({
            tr: response.data.analysis.tr,
            en: response.data.analysis.en,
          });
          setLoading(false);
          stopPolling(); // Başarılı, polling'i bitir
        } else if (retryCount.current >= maxRetries) {
          setLoading(false);
          stopPolling(); // Max deneme, polling'i bitir
          showNotification(t('aiAnalyse.notifications.genericError'));
        }
      } catch (err: unknown) {
        // Axios'un yerleşik iptal kontrolü
        if (axios.isCancel(err)) {
          // İstek bilerek iptal edildi (sayfadan çıkış vb.)
          return;
        }

        if (axios.isAxiosError(err)) {
          // Bu bir API hatasıdır (401, 500 vb.)
          console.log('API Polling error:', err.response?.data || err.message);
        } else if (err instanceof Error) {
          // Diğer JS hataları
          console.log('General error:', err.message);
        }
      }
    }, 3000);
  }, [stopPolling, t]);

  const requestNewAnalysis = async () => {
    if (loading) return;

    setLoading(true);
    setAnalysis({ tr: null, en: null });

    try {
      const response = await api.get('/api/user/newanalyze', {
        requiresAuth: true,
        signal: abortController.current.signal,
      });

      if (isMounted.current && response.status === 200) {
        startPolling();
      } else {
        if (isMounted.current) {
          setLoading(false);
          showNotification(t('aiAnalyse.notifications.createError'));
        }
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }

      if (isMounted.current) {
        showNotification(t('aiAnalyse.notifications.genericError'));
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerinside}>
        <Text style={styles.title}>{t('aiAnalyse.title')}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loaderText}>
                {t('aiAnalyse.loadingText')}
              </Text>
              <Text style={styles.subLoaderText}>
                {t('aiAnalyse.analyseLoading')}
              </Text>
            </View>
          ) : (
            <Markdown style={styles.markdown}>
              {(isEnglish ? analysis.en : analysis.tr) ||
                t('aiAnalyse.emptyText')}
            </Markdown>
          )}
        </ScrollView>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.aiAnalysisBtn, loading && styles.buttonDisabled]}
            onPress={requestNewAnalysis}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{t('aiAnalyse.buttonText')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AiAnalyse;
