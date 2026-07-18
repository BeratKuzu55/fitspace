import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loader from '../../../components/Loader';
import RoundedButton from '../../../components/RoundedButton';
import { equipmentImages } from '../../assets/imageMaps';
import { api } from '../../services/api';
import { useAppDispatch } from '../../store';
import { setEquipments as setReduxEquipments } from '../../store/slices/exereyeEquipmentSlice';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

interface Equipment {
  id: number;
  name: string;
  type: string;
}

type RootStackParamList = {
  EquipmentOverride: { detected?: { detectedEquipments: Equipment[] } };
  ExerciseConfigure: { selectedEquipments: Equipment[] };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EquipmentOverride'
>;

type Props = Record<string, never>;

const EquipmentOverride: React.FC<Props> = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'EquipmentOverride'>>();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  // --- EKİPMANLARI GETİR ---
  const fetchEquipments = useCallback(async () => {
    try {
      const response = await api.get<Equipment[]>('/api/equipments', {
        requiresAuth: true,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setAllEquipments(response.data);

        // AI tarafından tespit edilenleri otomatik seç (Opsiyonel zincirleme ile güvenli erişim)
        const detectedFromAI = route.params?.detected?.detectedEquipments || [];
        if (detectedFromAI.length > 0) {
          const initialIds = new Set(detectedFromAI.map(e => e.id));
          setSelectedIds(initialIds);
        }
      }
    } catch (error) {
      showNotification(
        t('equipmentOverride.notifications.authErrorTitle'),
        t('equipmentOverride.notifications.fetchError'),
        'danger',
      );
      console.error('Fetch Equipments Error:', error);
    } finally {
      setLoading(false);
    }
  }, [route.params, t]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  // --- SEÇİM AKSİYONLARI ---
  const toggleSelection = useCallback(
    (id: number) => {
      setSelectedIds(prev => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
          return next;
        }

        if (next.size >= 3) {
          showNotification(
            t('exerciseConfigure.notifications.errorTitle'),
            t('exerciseConfigure.notifications.selectEquipment'),
            'info',
          );
          return prev;
        }

        next.add(id);
        return next;
      });
    },
    [t],
  );

  const handleSubmit = () => {
    const finalSelected = allEquipments.filter(eq => selectedIds.has(eq.id));
    dispatch(setReduxEquipments(finalSelected));
    navigation.push('ExerciseConfigure', { selectedEquipments: finalSelected });
  };

  const formatEquipmentName = (name: string) => {
    if (!name) return '';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // --- LİSTE ELEMANI ---
  const renderEquipmentItem = ({ item }: { item: Equipment }) => {
    const isSelected = selectedIds.has(item.id);
    const sourceImage: number = equipmentImages[item.id] as number;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.equipmentCard, isSelected && styles.selectedCard]}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={styles.imageContainerEquipment}>
          <FastImage
            source={sourceImage}
            style={styles.imageStyle}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <Text style={styles.equipmentNameText} numberOfLines={1}>
          {formatEquipmentName(item.name)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Listeleri verimli bir şekilde filtrele (Hafıza optimizasyonu)
  const { selectedList, availableList } = useMemo(() => {
    return {
      selectedList: allEquipments.filter(e => selectedIds.has(e.id)),
      availableList: allEquipments.filter(e => !selectedIds.has(e.id)),
    };
  }, [allEquipments, selectedIds]);

  if (loading) return <Loader />;

  return (
    <SafeAreaProvider style={styles.container}>
      <FlatList
        data={null}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <Text style={styles.titleOverride}>
              {t('equipmentOverride.sections.selected')}
            </Text>
            <FlatList
              data={selectedList}
              renderItem={renderEquipmentItem}
              keyExtractor={item => `sel-${item.id}`}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridWrapper}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {t('equipmentOverride.empty.selected')}
                </Text>
              }
            />

            <RoundedButton
              style={styles.submitButton}
              text={`${t('equipmentOverride.continue')} (${selectedIds.size})`}
              onPress={handleSubmit}
              disabled={selectedIds.size === 0}
            />

            <Text style={styles.titleOverride}>
              {t('equipmentOverride.sections.available')}
            </Text>
          </View>
        }
        ListFooterComponent={
          <FlatList
            data={availableList}
            renderItem={renderEquipmentItem}
            keyExtractor={item => `avail-${item.id}`}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridWrapper}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {t('equipmentOverride.empty.available')}
              </Text>
            }
          />
        }
      />
    </SafeAreaProvider>
  );
};

export default EquipmentOverride;
