import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import i18n from '../../../locales/i18n';
import { api } from '../../../services/api';
import { levelTR } from '../../../services/program';
import { useTheme } from '../../../theme';
import { FilterDropdown } from './filterDropdown';
import { ProgramListItem } from './programListItem';
import ProgramSummaryModal from './programSummaryModal';
import useStyles from './styles';

const DURATION_OPTIONS = [4, 8, 12];
const REGION_OPTIONS = ['chest', 'back', 'leg', 'arm', 'shoulder', 'abdomen'];
const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'];

type ProgramFrontProps = Record<string, never>;

const ProgramFront: React.FC<ProgramFrontProps> = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const isMounted = useRef(true);

  const [filterLevel, setFilterLevel] = useState<string | number>('all');
  const [filterDuration, setFilterDuration] = useState<number | 'all'>('all');
  const [filterRegion, setFilterRegion] = useState<string | number>('all');

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [startingProgram, setStartingProgram] = useState<boolean>(false);

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const resp = await api.get('/api/programs', {
          requiresAuth: true,
          signal: controller.signal,
          validateStatus: s => s < 500,
        });

        if (isMounted.current && resp.status === 200) {
          const enriched = resp.data.map(p => ({
            ...p,
            weeklyRegions:
              p.day_workouts?.slice(0, 7).map((dw: any) => dw.body_region) ||
              [],
          }));
          setPrograms(enriched);
        }
      } catch (err: any) {
        if (err?.name !== 'CanceledError') console.error(err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchPrograms();
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  const filtered = useMemo(() => {
    return programs.filter(p => {
      const matchLevel = filterLevel === 'all' || p.level === filterLevel;
      const matchDuration =
        filterDuration === 'all' || p.duration === filterDuration;
      const matchRegion =
        filterRegion === 'all' || p.body_region === filterRegion;
      return matchLevel && matchDuration && matchRegion;
    });
  }, [filterLevel, filterDuration, filterRegion, programs]);

  // Format Helperları (useCallback ile stabilize edildi)
  const formatLevel = useCallback(
    (val: any) => (val === 'all' ? t('common.all') : levelTR(val)),
    [t],
  );
  const formatDuration = useCallback(
    (val: any) =>
      val === 'all'
        ? t('common.all')
        : `${val} ${isEnglish ? 'Weeks' : 'Hafta'}`,
    [isEnglish, t],
  );
  const formatRegion = useCallback(
    (val: any) => {
      if (val === 'all') return t('common.all');
      const regionMap: any = {
        chest: isEnglish ? 'Chest' : 'Göğüs',
        back: isEnglish ? 'Back' : 'Sırt',
        leg: isEnglish ? 'Legs' : 'Bacak',
        arm: isEnglish ? 'Arms' : 'Kol',
        shoulder: isEnglish ? 'Shoulders' : 'Omuz',
        abdomen: isEnglish ? 'Abdomen' : 'Karın',
      };
      return regionMap[val] || val;
    },
    [isEnglish, t],
  );

  const onStartProgram = useCallback(async () => {
    if (!selected || !isMounted.current) return;
    setStartingProgram(true);
    try {
      const resp = await api.post(
        '/api/program/update_user_program',
        { program_id: selected.id },
        { requiresAuth: true },
      );
      if (isMounted.current && resp.status === 200) {
        setVisible(false);
        navigation.navigate('Home', {
          screen: 'ProgramSelect',
          params: {
            program: {
              ...selected,
              dayWorkouts: selected.day_workouts || [],
              program_start_date: new Date().toISOString().split('T')[0],
            },
          },
        });
      }
    } finally {
      if (isMounted.current) setStartingProgram(false);
    }
  }, [navigation, selected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('programFront.title')}</Text>

      <FlatList
        data={filtered}
        keyExtractor={p => String(p.id)}
        removeClippedSubviews={true}
        initialNumToRender={5}
        renderItem={({ item, index }) => (
          <ProgramListItem
            item={item}
            onPress={() => {
              setSelected(item);
              setVisible(true);
            }}
            theme={theme}
            styles={styles}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filtersContainer}>
              <FilterDropdown
                label={t('programFront.level')}
                value={filterLevel}
                options={LEVEL_OPTIONS}
                onSelect={setFilterLevel}
                displayFormat={formatLevel}
                theme={theme}
                styles={styles}
                t={t}
              />
              <FilterDropdown
                label={t('programFront.duration')}
                value={filterDuration}
                options={DURATION_OPTIONS}
                onSelect={(v: any) => setFilterDuration(v)}
                displayFormat={formatDuration}
                theme={theme}
                styles={styles}
                t={t}
              />
              <FilterDropdown
                label={t('programFront.region')}
                value={filterRegion}
                options={REGION_OPTIONS}
                onSelect={setFilterRegion}
                displayFormat={formatRegion}
                theme={theme}
                styles={styles}
                t={t}
              />
            </View>
            {loading && (
              <Text
                style={{
                  marginTop: 16,
                  color: theme.colors.textPrimary,
                  textAlign: 'center',
                }}
              >
                {t('programFront.loading')}
              </Text>
            )}
            {!loading && filtered.length === 0 && (
              <Text
                style={{
                  marginTop: 24,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                {t('programFront.noResults')}
              </Text>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <ProgramSummaryModal
        visible={visible}
        selected={selected}
        onClose={() => {
          setVisible(false);
          setSelected(null);
        }}
        onStart={onStartProgram}
        starting={startingProgram}
        isEnglish={isEnglish}
        theme={theme}
        styles={styles}
        t={t}
      />
    </View>
  );
};

export default ProgramFront;
