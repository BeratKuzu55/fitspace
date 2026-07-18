import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
import i18n from '../locales/i18n';

export type Ex = {
  repetitions?: number | string;
  setcount?: number | string;
  duration?: number | string;
};

export const difficultyLabelTR = (d?: string | number) => {
  const currentLanguage = i18n.language || 'tr';
  const isEnglish = currentLanguage === 'en';

  if (isEnglish) return String(d).charAt(0).toUpperCase() + String(d).slice(1);

  const key = String(d ?? '').toLowerCase();
  if (key === 'beginner') return 'Başlangıç';
  if (key === 'intermediate') return 'Orta';
  if (key === 'advanced') return 'İleri';
  return '—';
};

export const formatGeneralDuration = (duration: number) => {
  //  const duration = typeof sec === 'number' ? Math.max(0, Math.floor(sec)) : 0;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDurationOrReps = (
  duration: number,
  setcount: number,
  repetitions: number,
): any => {
  if (duration === 0 && setcount > 0 && repetitions > 0) {
    return `${repetitions}X`;
  } else {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
};

export const fetchImage = async (folderName: string, id: number) => {
  try {
    if (id) {
      const folderRef = ref(storage, folderName);
      const listResult = await listAll(folderRef);
      const _File = listResult.items.find(item =>
        item.name.startsWith(`${id}`),
      );

      if (!_File) {
        return '';
      }
      const url = await getDownloadURL(_File);
      return url;
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};

const videoUrlCache = new Map<number, string>();

export const fetchVideoUrlDirectly = async (id: number): Promise<string> => {
  try {
    if (!id) return '';
    // Return cached URL if available
    if (videoUrlCache.has(id)) return videoUrlCache.get(id)!;

    const videoPath = `exercise-videos/${id}.mp4`;
    const videoRef = ref(storage, videoPath);
    const url = await getDownloadURL(videoRef);
    if (url) videoUrlCache.set(id, url);
    return url;
  } catch (error) {
    console.error('Video getirme hatası (ID bulunamadı):', id, error);
    return ''; // Hata durumunda boş dön
  }
};

export const prefetchVideoUrl = async (id: number) => {
  // Simple helper to trigger caching without awaiting a return value elsewhere
  try {
    if (!id) return '';
    if (videoUrlCache.has(id)) return videoUrlCache.get(id)!;
    const url = await fetchVideoUrlDirectly(id);
    return url;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return '';
  }
};
