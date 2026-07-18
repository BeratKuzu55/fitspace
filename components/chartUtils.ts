/** JS getDay(): 0=Paz...6=Cmt -> Pzt:0...Paz:6 */
export const mapGetDayToIndex = (getDayVal: number) =>
  getDayVal === 0 ? 6 : getDayVal - 1;

/** Min–Max Normalizasyonu [0,1] */
export const normalizeData = (arr: number[]) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 0);
  return arr.map(v => (v - min) / (max - min));
};

/** X Etiketlerini seyreltme */
export const sparsifyLabels = (labels: string[], maxVisible: number) => {
  if (labels.length <= maxVisible) return labels;
  const step = Math.ceil(labels.length / maxVisible);
  return labels.map((l, i) =>
    i % step === 0 || i === labels.length - 1 ? l : '',
  );
};

/** Aylık grafik genişliği */
export const getMonthlyWidth = (screenWidth: number, days: number) =>
  Math.max(Math.floor(screenWidth * 0.94), days * 32);
