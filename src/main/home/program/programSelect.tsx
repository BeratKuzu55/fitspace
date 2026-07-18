import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faChevronLeft,
  faChevronRight,
  faClock,
  faDumbbell,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { Text } from 'react-native-paper';
import i18n from '../../../locales/i18n';
import { api } from '../../../services/api';
import { bodyRegionColorByName } from '../../../services/program';
import { primitives } from '../../../../styles/colors';
import { useTheme } from '../../../theme';
import { showNotification } from '../../../utils/notificationHelper';
import useStyles from './styles';
import useGlobalStyles from '../../../../styles/styles';

const currentLanguage = i18n.language || 'tr';
const isEnglish = currentLanguage === 'en';
const levelTR = (lvl?: string | number) => {
  if (isEnglish)
    return String(lvl).charAt(0).toUpperCase() + String(lvl).slice(1);

  const v = String(lvl || '').toLowerCase();
  if (v.includes('beginner')) return 'Başlangıç';
  if (v.includes('intermediate')) return 'Orta';
  if (v.includes('advanced')) return 'İleri';
  return lvl ? String(lvl) : '-';
};

const bodyRegionTR = (name?: string) => {
  if (isEnglish)
    return String(name).charAt(0).toUpperCase() + String(name).slice(1);

  const n = (name || '').toLowerCase();
  if (n.includes('abdomen') || n.includes('karın')) return 'Karın';
  if (n.includes('back') || n.includes('sırt')) return 'Sırt';
  if (n.includes('shoulder') || n.includes('omuz')) return 'Omuz';
  if (n.includes('chest') || n.includes('göğüs')) return 'Göğüs';
  if (n.includes('arm') || n.includes('kol')) return 'Kol';
  if (n.includes('leg') || n.includes('bacak')) return 'Bacak';
  if (n.includes('mobilite') || n.includes('mobility')) return 'Mobilite';
  return name || '-';
};

const toISODate = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);

const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const diffInDays = (a: Date, b: Date) => {
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((A - B) / (24 * 60 * 60 * 1000));
};

const contrastText = (hex?: string) => {
  if (!hex) return primitives.black;
  const c = hex.replace('#', '');
  if (c.length !== 6) return primitives.black;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const L = 0.299 * r + 0.587 * g + 0.114 * b;
  return L > 160 ? primitives.black : primitives.white;
};

type Workout = {
  id: number | string;
  name?: string;
  name_en: string;
  duration?: number;
  calories?: number;
  description?: string;
  description_en: string;
  equipment?: string[];
};

type DayWorkout = {
  id: number | string;
  week: number;
  day: number;
  body_region?: string;
  workout: Workout;
};

type Program = {
  id: number | string;
  name?: string;
  name_en: string;
  created_at?: string;
  duration?: number;
  level?: string;
  body_region?: string;
  description?: string;
  description_en: string;
  equipment?: string[];
  dayWorkouts?: DayWorkout[];
  program_start_date?: string;
};

type CompletedWorkout = {
  id: number | string;
  complete_date: string;
  workout: Workout;
};

LocaleConfig.locales.tr = {
  monthNames: isEnglish
    ? [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
    : [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ],
  monthNamesShort: [
    'Oca',
    'Şub',
    'Mar',
    'Nis',
    'May',
    'Haz',
    'Tem',
    'Ağu',
    'Eyl',
    'Eki',
    'Kas',
    'Ara',
  ],
  dayNames: isEnglish
    ? [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
    : [
        'Pazar',
        'Pazartesi',
        'Salı',
        'Çarşamba',
        'Perşembe',
        'Cuma',
        'Cumartesi',
      ],
  dayNamesShort: isEnglish
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
  today: 'Bugün',
};
LocaleConfig.defaultLocale = 'tr';

type ProgramSelectProps = Record<string, never>;

const ProgramSelect: React.FC<ProgramSelectProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);  
  const globalStyles = useGlobalStyles(theme);
  const route = useRoute<any>();
  const [selected, setSelected] = useState<string>('');
  const [calendarDate, setCalendarDate] = useState<string | undefined>(
    undefined,
  );
  const program = route?.params?.program as Program;

  const todayStr = useMemo(() => toISODate(new Date()), []);
  const isSelectedDateToday = selected === todayStr;

  const [completedWorkouts, setCompletedWorkouts] = useState<
    CompletedWorkout[]
  >([]);
  const [leavingProgram, setLeavingProgram] = useState<boolean>(false);

  const grid = useMemo(() => {
    const g: (DayWorkout | null)[][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 7 }, () => null),
    );
    for (const dw of program?.dayWorkouts ?? []) {
      const w = Math.max(1, Math.min(4, Number(dw.week || 1))) - 1;
      const d = Math.max(1, Math.min(7, Number(dw.day || 1))) - 1;
      g[w][d] = dw;
    }
    return g;
  }, [program?.dayWorkouts]);

  // === Tarihler ===
  const startDate: Date | null = program?.program_start_date
    ? new Date(program.program_start_date)
    : null;
  const totalDays: number = Math.max(1, Number(program?.duration || 1)) * 28;
  const endDate: Date | null = startDate
    ? addDays(startDate, totalDays - 1)
    : null;

  // === Seçili gün (ilk açılışta bugün) ===

  useEffect(() => {
    if (!startDate) {
      console.log('No startDate, cannot set selected date');
      return;
    }
    const today = new Date();
    const inRange = endDate && today >= startDate && today <= endDate;
    const selectedDate = inRange ? toISODate(today) : toISODate(startDate);
    setSelected(prev => prev || selectedDate);
    setCalendarDate(prev => prev || selectedDate);
  }, [startDate, endDate]);

  // === Gün -> dayWorkout ===
  const getDayWorkoutByDate = (dateStr?: string): DayWorkout | null => {
    if (!dateStr || !startDate) {
      return null;
    }
    const d = new Date(dateStr);
    const offset = diffInDays(d, startDate);
    if (offset < 0 || offset >= totalDays) {
      return null;
    }
    const weekInCycle = Math.floor(offset / 7) % 4; // 0..3
    const dayInWeek = offset % 7; // 0..6
    const result = grid[weekInCycle]?.[dayInWeek] ?? null;
    return result;
  };

  const markedDates = useMemo(() => {
    if (!startDate) return {};

    const marks: Record<string, any> = {};

    for (let offset = 0; offset < totalDays; offset++) {
      const dateKey = toISODate(addDays(startDate, offset));
      const weekInCycle = Math.floor(offset / 7) % 4;
      const dayInWeek = offset % 7;
      const dayWorkout = grid[weekInCycle]?.[dayInWeek];

      if (dayWorkout) {
        const isSelected = selected === dateKey;

        // Tamamlanmış mı kontrol et
        const isCompleted = completedWorkouts.some(
          cw => toISODate(new Date(cw.complete_date)) === dateKey,
        );

        // Günün arka plan rengi
        const backgroundColor = isCompleted
          ? theme.colors.secondary // tamamlanmış günler yeşil
          : bodyRegionColorByName(theme, dayWorkout.body_region);

        marks[dateKey] = {
          customStyles: {
            container: {
              backgroundColor,
              borderRadius: 12,
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected
                ? theme.colors.textPrimary
                : theme.colors.transparent,
            },
            text: {
              color: contrastText(backgroundColor),
              fontWeight: isSelected ? '700' : '600',
            },
          },
        };
      }
    }

    if (selected && !marks[selected]) {
      marks[selected] = {
        customStyles: {
          container: {
            backgroundColor: theme.colors.border,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.textPrimary,
          },
          text: {
            color: theme.colors.textPrimary,
            fontWeight: '700',
          },
        },
      };
    }

    return marks;
  }, [startDate, totalDays, grid, selected, theme, completedWorkouts]);

  // === Header badgeleri/özet ===
  const createdAtStr = startDate ? startDate.toLocaleDateString() : '-';
  const durationStr = `${Math.max(1, Number(program?.duration || 1))} ${t('programSelect.week')}`;
  const levelStr = levelTR(program?.level);
  const targetRegionStr = bodyRegionTR(program?.body_region);

  // === Seçili güne ait antrenman ===
  const selectedDW = getDayWorkoutByDate(selected);
  const selectedWorkout = selectedDW?.workout ?? null;

  const handleGetCompletedWorkouts = async () => {
    try {
      const response = await api.get('/api/static_workout_complete', {
        validateStatus: s => s < 500,
        requiresAuth: true,
      });

      if (response.status === 200 && response.data?.response) {
        setCompletedWorkouts(response.data.response);
      } else {
        console.warn(
          'Completed workouts fetch failed:',
          response.status,
          response.data,
        );
        setCompletedWorkouts([]);
      }
    } catch (error) {
      console.error('Completed workouts error:', error);
      showNotification('Tamamlanan antrenmanlar alınamadı');
      setCompletedWorkouts([]);
    }
  };

  const handleProgramLeft = async () => {
    setLeavingProgram(true);
    try {
      const response = await api.get('/api/program/left', {
        validateStatus: s => s < 500,
        requiresAuth: true,
      });

      if (response.status === 200) {
        showNotification('Programdan ayrıldınız');
        navigation.navigate('ProgramFront');
      } else {
        showNotification('Programdan çıkma işlemi başarısız.');
      }
    } catch (error) {
      console.error('Program exit error:', error);
      showNotification('Programdan çıkma işlemi başarısız.');
    } finally {
      setLeavingProgram(false);
    }
  };

  useEffect(() => {
    handleGetCompletedWorkouts();
  }, []);

  const calendarTheme = useMemo(() => ({
      // Arka planlar
      calendarBackground: theme.dark ? theme.colors.backgroundOverlay : theme.colors.surface,
      backgroundColor: theme.dark ? theme.colors.backgroundOverlay : theme.colors.surface,

      // Gün sayıları
      textSectionTitleColor: theme.colors.textSecondary,
      dayTextColor: theme.colors.textPrimary,
      todayTextColor: theme.colors.primary,
      monthTextColor: theme.colors.textPrimary,
      selectedDayBackgroundColor: theme.colors.primary,
      selectedDayTextColor: theme.colors.onPrimary,
      textDisabledColor: theme.colors.border, // Diğer ayların günleri

      // Başlık (Ay ve Yıl)
      textMonthFontWeight: 'bold' as const,
      textMonthFontSize: 18,

      // Oklar
      arrowColor: theme.colors.primary,

      // Fontlar (Eğer özel font kullanıyorsanız buraya ekleyebilirsiniz)
      textDayFontSize: 14,
      textDayHeaderFontSize: 12,
      textDayHeaderFontWeight: '600' as const,
    }),
    [theme],
  );

  return (
    <View style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      <Text style={styles.title}>
        {isEnglish ? program?.name_en : program?.name}
      </Text>
      <Calendar
        key={theme.dark ? 'dark-calendar' : 'light-calendar'}
        markingType="custom"
        markedDates={{
          ...markedDates,
          [selected]: {
            selected: true,
            customStyles: {
              container: {
                backgroundColor: theme.colors.primary,
                elevation: 4,
                borderRadius: 8,
                borderWidth: 0,
              },
              text: {
                color: theme.colors.onPrimary,
                fontWeight: 'bold',
              },
            },
          },
        }}
        theme={calendarTheme}
        style={[styles.calendar, { backgroundColor: theme.dark ? theme.colors.backgroundOverlay : theme.colors.surface }]}
        headerStyle={{ backgroundColor: theme.dark ? theme.colors.backgroundOverlay : theme.colors.surface }}
        monthFormat="MMMM yyyy"
        firstDay={1}
        current={calendarDate}
        onDayPress={(date: DateData) => {
          setSelected(date.dateString);
          setCalendarDate(date.dateString);
        }}
        onMonthChange={(month: DateData) => setCalendarDate(month.dateString)}
        renderArrow={(direction: 'left' | 'right') => (
          <FontAwesomeIcon
            icon={
              direction === 'left'
                ? (faChevronLeft as IconProp)
                : (faChevronRight as IconProp)
            }
            color={theme.colors.primary}
            size={16}
          />
        )}
      />

      {/* Seçili Gün Kartı */}
      <View style={styles.card}>
        <View style={styles.dayCardHeader}>
          <Text style={styles.dayTitle}>
            {t('programSelect.selectedDayWorkout')}
          </Text>
        </View>
        {selectedDW ? (
          <>
            <Text style={styles.workoutName}>
              {isEnglish
                ? selectedWorkout?.name_en
                : (selectedWorkout?.name ?? t('programSelect.workout'))}
            </Text>
            <View style={styles.workoutStat}>
              {selectedWorkout?.duration ? (
                <View style={styles.statItem}>
                  <FontAwesomeIcon icon={faClock as IconProp} size={12} />
                  <Text style={styles.statText}>
                    {selectedWorkout.duration} {t('programSelect.minutes')}
                  </Text>
                </View>
              ) : null}
              {selectedDW?.body_region ? (
                <View style={styles.statItem}>
                  <FontAwesomeIcon
                    icon={faDumbbell as IconProp}
                    size={12}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.statText}>
                    {bodyRegionTR(selectedDW.body_region)}
                  </Text>
                </View>
              ) : null}
            </View>
            {selectedWorkout?.description ? (
              <Text style={styles.description}>
                {isEnglish
                  ? selectedWorkout.description_en
                  : selectedWorkout.description}
                !
              </Text>
            ) : null}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: isSelectedDateToday
                    ? theme.colors.primary
                    : theme.colors.googleRed,
                },
              ]}
              onPress={() =>
                navigation.navigate('ActivityManager', {
                  workoutId: String(selectedWorkout?.id),
                })
              }
              disabled={!isSelectedDateToday}
            >
              <Text style={styles.primaryBtnText}>
                {isSelectedDateToday
                  ? t('programSelect.startWorkout')
                  : t('programSelect.notTodayWorkout') ||
                    'Sadece Bugünün Antrenmanını Yapabilirsin'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>
            {t('programSelect.noWorkoutForDate')}
          </Text>
        )}
      </View>

      {/* Genel bilgiler kartı */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.subtitle}>{t('programSelect.generalInfo')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('programSelect.start')}</Text>
          <Text style={styles.infoValue}>{createdAtStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('programSelect.duration')}</Text>
          <Text style={styles.infoValue}>{durationStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('programSelect.level')}</Text>
          <Text style={styles.infoValue}>{levelStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            {t('programSelect.targetRegion')}
          </Text>
          <Text style={styles.infoValue}>{targetRegionStr}</Text>
        </View>
      </View>

      {/* Açıklama */}
      {program?.description ? (
        <View style={styles.card}>
          <Text style={styles.subtitle}>{t('programSelect.summary')}</Text>
          <Text style={styles.description}>
            {isEnglish ? program.description_en : program.description}
          </Text>
          <TouchableOpacity
            onPress={() => {
              handleProgramLeft();
            }}
            disabled={leavingProgram}
            style={[styles.leftProgram, leavingProgram && styles.opacity]}
          >
            <Text style={styles.leftProgramText}>
              {leavingProgram
                ? t('programSelect.leaving')
                : t('programSelect.leaveProgram')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProgramSelect;
