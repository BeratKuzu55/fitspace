import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import RadioButton from '../../../components/RadioButton';
import RoundedButton from '../../../components/RoundedButton';
import SegmentSwitch from '../../../components/SegmentSwitch';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import { setUserDiseases } from '../../store/slices/userSlice';
import { useAppDispatch } from '../../store';
interface Disease {
  is_injury: boolean;
  name: string;
  description: string;
  id: number;
  display_name?: string;
}

type HealthProblemsProps = Record<string, never>;

const HealthProblems: React.FC<HealthProblemsProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const isMounted = useRef(true);
  const dispatch = useAppDispatch();
  
  const tabs = useMemo(
    () => [
      t('healthProblems.tabs.diseases'),
      t('healthProblems.tabs.injuries'),
    ],
    [t],
  );

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getDisplayName = useCallback(
    (name: string) => {
      return t(`setup.diseases.${name}`, name);
    },
    [t],
  );

  const fetchData = useCallback(async () => {
    try {
      const [allDiseasesRes, userProfileRes] = await Promise.all([
        api.get('/api/diseases', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        }),
        api.get('/api/user', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        }),
      ]);

      if (!isMounted.current) return;

      if (allDiseasesRes.status === 200 && Array.isArray(allDiseasesRes.data)) {
        const enriched = allDiseasesRes.data.map((d: Disease) => ({
          ...d,
          display_name: getDisplayName(d.name),
        }));
        setDiseases(enriched);
      }

      if (userProfileRes.status === 200 && userProfileRes.data?.user) {
        const userDiseasesFromApi: Disease[] =
          userProfileRes.data.user.diseases || [];
        const initialIds = userDiseasesFromApi.map(d => d.id.toString());
        setSelectedOptions(initialIds);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('healthProblems.notifications.errorTitle'),
        t('healthProblems.notifications.infoFetchFailed'),
        'danger',
      );
    }
  }, [getDisplayName, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const toggleSelection = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(item => item !== optionId)
        : [...prev, optionId],
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedIds = selectedOptions.map(id => Number(id));

      const res = await api.post(
        '/api/user',
        { diseases: selectedIds },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );

      if (res.status >= 200 && res.status < 300) {
        showNotification(
          t('healthProblems.notifications.updateSuccessTitle'),
          t('healthProblems.notifications.updateSuccessMessage'),
          'success',
        );
        dispatch(
          setUserDiseases(selectedIds),
        );
      } else {
        showNotification(
          t('healthProblems.notifications.errorTitle'),
          t('healthProblems.notifications.updateFailed'),
          'danger',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('healthProblems.notifications.errorTitle'),
        t('healthProblems.notifications.updateFailed'),
        'danger',
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Aktif taba göre listeyi filtrele
  const currentOptions = useMemo(() => {
    const isInjuryTab = activeTab === t('healthProblems.tabs.injuries');
    return diseases.filter(d => d.is_injury === isInjuryTab);
  }, [activeTab, diseases, t]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>{t('healthProblems.title')}</Text>
      <SegmentSwitch
        options={tabs}
        selected={activeTab}
        onSelect={setActiveTab}
      />
      <Text style={styles.subtitle}>{t('healthProblems.warning')}</Text>
      <View style={styles.radioGroup}>
        {currentOptions.map(option => (
          <RadioButton
            key={option.id}
            title={option.display_name || option.name}
            selected={selectedOptions.includes(option.id.toString())}
            onPress={() => toggleSelection(option.id.toString())}
          />
        ))}
      </View>
      <RoundedButton
        text={t('healthProblems.buttons.confirm')}
        onPress={handleSubmit}
        loading={loading}
      />
    </ScrollView>
  );
};

export default HealthProblems;
