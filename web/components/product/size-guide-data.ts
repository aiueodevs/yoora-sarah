export interface SizeChartMeasurement {
  label: string;
  values: Record<string, number>;
}

export interface SizeChartData {
  seriesName: string;
  sizes: string[];
  measurements: SizeChartMeasurement[];
  note: string;
}

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
}

export function recommendSize(height: number, weight: number, sizes: string[]): string {
  const sorted = sortSizes(sizes);

  // Simple heuristic for Indonesian muslim fashion dress sizing
  const score = height * 0.6 + weight * 0.4;

  if (sorted.includes('XL') && (score >= 130 || height >= 170 || weight >= 75)) return 'XL';
  if (sorted.includes('L') && (score >= 120 || height >= 163 || weight >= 65)) return 'L';
  if (sorted.includes('M') && (score >= 110 || height >= 155 || weight >= 55)) return 'M';
  return sorted[0] || 'S';
}

export const sizeChartMap: Record<string, SizeChartData> = {
  'bella-dress-4179': {
    seriesName: 'Bella Series',
    sizes: ['S', 'M', 'L', 'XL'],
    measurements: [
      { label: 'Panjang Badan', values: { S: 127, M: 135, L: 140, XL: 145 } },
      { label: 'Lingkar Dada', values: { S: 100, M: 100, L: 110, XL: 120 } },
      { label: 'Panjang Lengan', values: { S: 56, M: 56, L: 58, XL: 58 } },
      { label: 'Lingkar Ketiak', values: { S: 48, M: 46, L: 52, XL: 52 } },
    ],
    note: 'Seluruh detail ukuran pada produk ini menggunakan satuan centimeter (cm)',
  },
  'yoora-dress-9662': {
    seriesName: 'Yoora Dress',
    sizes: ['S', 'M', 'L'],
    measurements: [
      { label: 'Panjang Badan', values: { S: 127, M: 135, L: 141 } },
      { label: 'Lingkar Dada', values: { S: 138, M: 138, L: 140 } },
      { label: 'Panjang Lengan', values: { S: 71, M: 73, L: 72 } },
      { label: 'Lingkar Ketiak', values: { S: 32, M: 32, L: 33 } },
    ],
    note: 'Seluruh detail ukuran pada produk ini menggunakan satuan centimeter (cm)',
  },
  'clara-dress-5254': {
    seriesName: 'Clara Series',
    sizes: ['S', 'M', 'L', 'XL'],
    measurements: [
      { label: 'Panjang Badan', values: { S: 127, M: 135, L: 140, XL: 147 } },
      { label: 'Lingkar Dada', values: { S: 110, M: 110, L: 110, XL: 120 } },
    ],
    note: 'Seluruh detail ukuran pada produk ini menggunakan satuan centimeter (cm)',
  },
  'medina-dress-8751': {
    seriesName: 'Medina Dress',
    sizes: ['S', 'M', 'L', 'XL'],
    measurements: [
      { label: 'Panjang Badan', values: { S: 127, M: 132, L: 140, XL: 142 } },
      { label: 'Lingkar Dada', values: { S: 100, M: 100, L: 110, XL: 120 } },
    ],
    note: 'Seluruh detail ukuran pada produk ini menggunakan satuan centimeter (cm)',
  },
};
