import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../src/theme';
import { ChartTab } from './chartTab';
import * as Utils from './chartUtils';
import useStyles from './component_styles';
import { StatisticsChartProps } from './types';

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  last7DaysWorkouts,
  last30DaysWorkouts = [],
  initialPeriod = 'week',
  normalize: initialNormalize = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { width: screenWidth } = useWindowDimensions();

  const [period, setPeriod] = useState(initialPeriod);
  const [isNormalized, setIsNormalized] = useState(initialNormalize);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: '',
  });

  const LABELS_WEEK = useMemo(
    () => [
      t('statisticsChart.weekDayLabels.monday'),
      t('statisticsChart.weekDayLabels.tuesday'),
      t('statisticsChart.weekDayLabels.wednesday'),
      t('statisticsChart.weekDayLabels.thursday'),
      t('statisticsChart.weekDayLabels.friday'),
      t('statisticsChart.weekDayLabels.saturday'),
      t('statisticsChart.weekDayLabels.sunday'),
    ],
    [t],
  );

  const chartData = useMemo(() => {
    const isWeek = period === 'week';
    const days = isWeek ? 7 : 30;
    const cals = Array(days).fill(0);
    const cnts = Array(days).fill(0);

    const source = isWeek ? last7DaysWorkouts : last30DaysWorkouts;

    // HAFTALIK ise LABELS_WEEK, AYLIK ise 1-30 sayıları
    const labels = isWeek
      ? LABELS_WEEK
      : Array.from({ length: 30 }, (_, i) => `${i + 1}`);

    source.forEach(w => {
      const d = new Date(w.complete_date);
      if (isWeek) {
        // Senin mapGetDayToIndex fonksiyonun: Pzt=0, Sal=1 ... Paz=6 döner.
        const idx = Utils.mapGetDayToIndex(d.getDay());
        if (idx >= 0 && idx < 7) {
          cals[idx] += Number(w.calories || 0);
          cnts[idx] += 1;
        }
      } else {
        // Aylık mantık: Bugünden geriye 30 gün
        const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
        const idx = 29 - diffDays;
        if (idx >= 0 && idx < 30) {
          cals[idx] += Number(w.calories || 0);
          cnts[idx] += 1;
        }
      }
    });

    return {
      labels,
      calories: isNormalized ? Utils.normalizeData(cals) : cals,
      counts: isNormalized ? Utils.normalizeData(cnts) : cnts,
    };
  }, [
    period,
    last7DaysWorkouts,
    last30DaysWorkouts,
    isNormalized,
    LABELS_WEEK,
  ]);

  // 2. Grafik Konfigürasyonu
  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: theme.colors.backgroundOverlay,
      backgroundGradientTo: theme.colors.backgroundOverlay,
      decimalPlaces: isNormalized ? 2 : 0,
      color: (opacity = 1) => {
        const white = theme.colors.surfaceContainer;
        // Extract RGB from hex and apply opacity
        const r = parseInt(white.slice(1, 3), 16);
        const g = parseInt(white.slice(3, 5), 16);
        const b = parseInt(white.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      },
      labelColor: () => theme.colors.textSecondary,
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: theme.colors.primary,
      },
      fillShadowGradientFrom: theme.colors.primary,
      fillShadowGradientTo: theme.colors.backgroundOverlay,
    }),
    [theme, isNormalized],
  );

  // 3. Tooltip İşleyicisi
  const renderTooltip = useCallback(() => {
    if (!tooltip.visible) return null;
    return (
      <Svg>
        <Rect
          x={tooltip.x - 28}
          y={tooltip.y - 35}
          width={56}
          height={25}
          rx={6}
          fill={theme.colors.onSurface}
        />
        <SvgText
          x={tooltip.x}
          y={tooltip.y - 18}
          fill={theme.colors.onPrimary}
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          {isNormalized ? tooltip.value.toFixed(2) : Math.round(tooltip.value)}
        </SvgText>
      </Svg>
    );
  }, [tooltip, theme, isNormalized]);

  const chartWidth =
    period === 'week'
      ? Math.floor(screenWidth * 0.92)
      : Utils.getMonthlyWidth(screenWidth, 30);

  return (
    <View style={styles.chartWrapper}>
      {/* Tab ve Normalize Butonu Satırı */}
      <View style={styles.tabContainer}>
        <View style={styles.tabButtons}>
          <ChartTab
            label={t('statisticsChart.tabs.week')}
            active={period === 'week'}
            onPress={() => {
              setPeriod('week');
              setTooltip(prev => ({ ...prev, visible: false }));
            }}
            theme={theme}
          />
          <ChartTab
            label={t('statisticsChart.tabs.month')}
            active={period === 'month'}
            onPress={() => {
              setPeriod('month');
              setTooltip(prev => ({ ...prev, visible: false }));
            }}
            theme={theme}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.normBtn,
            isNormalized && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setIsNormalized(!isNormalized)}
        >
          <Text
            style={[
              styles.normText,
              {
                color: isNormalized
                  ? theme.colors.onPrimary
                  : theme.colors.textSecondary,
              },
            ]}
          >
            {isNormalized
              ? t('statisticsChart.normalize.on')
              : t('statisticsChart.normalize.off')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chartTitle}>
        {period === 'week'
          ? t('statisticsChart.dailyCalories.week')
          : t('statisticsChart.dailyCalories.month')}{' '}
        {isNormalized ? `(${t('statisticsChart.normalizedIndicator')})` : ''}
      </Text>
      <ScrollView
        horizontal={period === 'month'}
        showsHorizontalScrollIndicator={false}
      >
        <LineChart
          data={{
            labels: Utils.sparsifyLabels(
              chartData.labels,
              period === 'week' ? 7 : 6,
            ),
            datasets: [
              { data: chartData.calories, color: () => theme.colors.primary },
            ],
          }}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          onDataPointClick={({ x, y, value, index }) =>
            setTooltip({
              visible: true,
              x,
              y,
              value,
              label: chartData.labels[index],
            })
          }
          decorator={renderTooltip}
          fromZero
          yAxisSuffix={isNormalized ? '' : ' kcal'}
          verticalLabelRotation={period === 'month' ? 30 : 0}
        />
      </ScrollView>

      <View style={styles.divider} />

      <Text style={styles.chartTitle}>
        {period === 'week'
          ? t('statisticsChart.dailyWorkoutCount.week')
          : t('statisticsChart.dailyWorkoutCount.month')}
        {isNormalized ? `(${t('statisticsChart.normalizedIndicator')})` : ''}
      </Text>
      <ScrollView
        horizontal={period === 'month'}
        showsHorizontalScrollIndicator={false}
      >
        <LineChart
          data={{
            labels: Utils.sparsifyLabels(
              chartData.labels,
              period === 'week' ? 7 : 6,
            ),
            datasets: [
              { data: chartData.counts, color: () => theme.colors.accent },
            ],
          }}
          width={chartWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            fillShadowGradientFrom: theme.colors.accent,
          }}
          bezier
          onDataPointClick={({ x, y, value, index }) =>
            setTooltip({
              visible: true,
              x,
              y,
              value,
              label: chartData.labels[index],
            })
          }
          decorator={renderTooltip}
          fromZero
          yAxisSuffix={isNormalized ? '' : ' x'}
          verticalLabelRotation={period === 'month' ? 30 : 0}
        />
      </ScrollView>
    </View>
  );
};

export default StatisticsChart;
