import { primitives } from '../../styles/colors';
import i18n from '../locales/i18n';

export const levelTR = (lv: Program['level']) => {
  const currentLanguage = i18n.language || 'tr';
  const isEnglish = currentLanguage === 'en';

  if (isEnglish)
    return String(lv).charAt(0).toUpperCase() + String(lv).slice(1);

  switch (lv) {
    case 'beginner':
      return 'Başlangıç';
    case 'intermediate':
      return 'Orta';
    case 'advanced':
      return 'İleri';
    default:
      return String(lv);
  }
};

export const levelBg = (theme: any, lv: Program['level']) => {
  if (lv === 'beginner') return theme.colors.lime500;
  if (lv === 'intermediate') return theme.colors.orange500;
  if (lv === 'advanced') return theme.colors.googleRed;
  return theme.colors.gray300;
};

export const bodyRegionColorByName = (theme: any, name?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('abdomen') || n.includes('karın')) return theme.colors.gold500;
  if (n.includes('back') || n.includes('sırt')) return theme.colors.purple300; // pembe/yeleğe en yakın
  if (n.includes('shoulder') || n.includes('omuz'))
    return theme.colors.facebookBlue;
  if (n.includes('chest') || n.includes('göğüs')) return theme.colors.lime500;
  if (n.includes('arm') || n.includes('kol')) return theme.colors.gray700;
  if (n.includes('leg') || n.includes('bacak')) return theme.colors.purple600;
  if (n.includes('mobilite') || n.includes('mobility'))
    return theme.colors.gray300;
  return theme.colors.gray300;
};

const isMobilityName = (name?: string) => {
  const n = (name || '').toLowerCase();
  return n === 'mobilite' || n === 'mobility' || n.includes('mobil');
};

export const dayColor = (theme: any, p: Program, dayIdx1to7: number) => {
  const idx = Math.max(0, Math.min(6, (dayIdx1to7 ?? 1) - 1));

  if (
    Array.isArray(p.weeklyRegions) &&
    typeof p.weeklyRegions[idx] === 'string'
  ) {
    const preRegion: string = p.weeklyRegions[idx];
    const region = preRegion.toLowerCase();

    if (!region) return theme.colors?.gray300; // hafif gri
    if (isMobilityName(region)) return theme.colors?.gray300 ?? primitives.slate300;

    return bodyRegionColorByName(theme, region);
  }

  const todays = (p.day_workouts || []).filter((dw: any) => {
    const d = (((dw?.day ?? 1) - 1) % 7) + 1;
    return d === dayIdx1to7;
  });

  if (todays.length === 0) {
    return (theme.colors?.gray300 ?? primitives.slate300) + '55';
  }

  // "mobilite" varsa gri
  const hasMobility = todays.some(
    (dw: any) =>
      isMobilityName(dw?.body_region) ||
      isMobilityName(dw?.workout?.body_region),
  );
  if (hasMobility) return theme.colors?.gray300 ?? primitives.slate300;

  // ilk öğenin bölgesine göre boya
  const brName =
    todays[0]?.body_region ?? todays[0]?.workout?.body_region_id ?? '';
  return bodyRegionColorByName(theme, brName);
};
