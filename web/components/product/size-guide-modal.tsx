'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Ruler } from 'lucide-react';
import { sizeChartMap, sortSizes, recommendSize } from './size-guide-data';

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSlug: string;
  productName: string;
  sizes: string[];
  selectedSize: string;
  onSelectSize?: (size: string) => void;
}

export function SizeGuideModal({
  open,
  onOpenChange,
  productSlug,
  productName,
  sizes,
  selectedSize,
  onSelectSize,
}: SizeGuideModalProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const sizeChart = sizeChartMap[productSlug];
  const sortedSizes = sortSizes(sizeChart?.sizes ?? sizes);

  const handleCalculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w)) return;
    setRecommendation(recommendSize(h, w, sortedSizes));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />

        {/* Panel — slides in from right on desktop, bottom on mobile */}
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col overflow-y-auto bg-[#faf8f6] shadow-2xl focus:outline-none"
        >
          {/* ─── Header ─── */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6dfd8] bg-[#faf8f6]/95 backdrop-blur-sm px-6 py-4">
            <Dialog.Title className="font-display text-lg tracking-tight text-[#241915]">
              Panduan Ukuran
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 text-[#8a6c5f] transition hover:bg-[#e6dfd8] hover:text-[#241915]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* ─── Body ─── */}
          <div className="flex-1 px-6 py-8">
            {/* Brand Butterfly — inline SVG */}
            <div className="mb-6 flex justify-center opacity-30">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 44c-2-4-8-12-8-20s4-14 8-18c4 4 8 10 8 18s-6 16-8 20Z" fill="#c4a48a" />
                <path d="M24 44c-6-2-16-8-20-16S2 12 6 6c4 4 12 10 18 14-2 6 0 16 0 24Z" fill="#c4a48a" opacity=".7" />
                <path d="M24 44c6-2 16-8 20-16s2-16-2-22c-4 4-12 10-18 14 2 6 0 16 0 24Z" fill="#c4a48a" opacity=".7" />
              </svg>
            </div>

            {/* Section Title */}
            <div className="mb-8 text-center">
              <h2 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-[#241915]">
                Size Chart
              </h2>
              <p className="mt-1 font-display text-lg text-[#a2806e]">
                {sizeChart?.seriesName ?? productName}
              </p>
            </div>

            {/* ─── Size Chart Table ─── */}
            {sizeChart ? (
              <div className="mb-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-[#e6dfd8] bg-[#f4ede7] px-3 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#8a6c5f]" />
                      {sortedSizes.map((size) => (
                        <th
                          key={size}
                          className={`border border-[#e6dfd8] px-3 py-3 text-center text-[0.8rem] font-semibold transition-colors ${
                            size === selectedSize
                              ? 'bg-[#241915] text-white'
                              : 'bg-[#f4ede7] text-[#241915]'
                          }`}
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.measurements.map((m) => (
                      <tr key={m.label}>
                        <td className="border border-[#e6dfd8] px-3 py-3.5 text-[0.75rem] font-medium text-[#5f4a41]">
                          {m.label}
                        </td>
                        {sortedSizes.map((size) => (
                          <td
                            key={size}
                            className={`border border-[#e6dfd8] px-3 py-3.5 text-center text-[0.85rem] tabular-nums ${
                              size === selectedSize
                                ? 'bg-[#241915]/[0.04] font-semibold text-[#241915]'
                                : 'text-[#5f4a41]'
                            }`}
                          >
                            {m.values[size]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-4 text-center text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a2806e]">
                  {sizeChart.note}
                </p>
              </div>
            ) : (
              <div className="mb-10 border border-[#e6dfd8] bg-[#f4ede7] px-6 py-10 text-center">
                <Ruler className="mx-auto mb-3 h-6 w-6 text-[#a2806e]" />
                <p className="text-[0.85rem] text-[#8a6c5f]">
                  Size chart untuk produk ini belum tersedia.
                </p>
              </div>
            )}

            {/* ─── Size Finder ─── */}
            <div className="border-t border-[#e6dfd8] pt-8">
              <div className="mb-6 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#a2806e]" />
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#241915]">
                  Temukan Ukuranmu
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[0.7rem] text-[#8a6c5f]">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={height}
                    onChange={(e) => { setHeight(e.target.value); setRecommendation(null); }}
                    placeholder="170"
                    className="w-full border-b border-[#e6dfd8] bg-transparent py-2 text-[0.9rem] text-[#241915] outline-none transition placeholder:text-[#ccc] focus:border-[#241915]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[0.7rem] text-[#8a6c5f]">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); setRecommendation(null); }}
                    placeholder="60"
                    className="w-full border-b border-[#e6dfd8] bg-transparent py-2 text-[0.9rem] text-[#241915] outline-none transition placeholder:text-[#ccc] focus:border-[#241915]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                disabled={!height || !weight}
                className="mt-6 w-full bg-[#1a110e] py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-white transition-all hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cari Ukuran Saya
              </button>

              {/* Recommendation Result */}
              {recommendation && (
                <div className="mt-6 border border-[#e6dfd8] bg-[#f4ede7] px-6 py-6 text-center">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#a2806e]">
                    Rekomendasi Ukuran
                  </p>
                  <p className="mt-2 font-display text-4xl tracking-tight text-[#241915]">
                    {recommendation}
                  </p>
                  <p className="mt-3 text-[0.75rem] leading-relaxed text-[#8a6c5f]">
                    Ukuran ini berdasarkan estimasi. Untuk hasil terbaik, silakan bandingkan dengan tabel ukuran di atas.
                  </p>
                  {onSelectSize && (
                    <button
                      type="button"
                      onClick={() => { onSelectSize(recommendation); onOpenChange(false); }}
                      className="mt-4 border border-[#241915] px-6 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[#241915] transition-all hover:bg-[#241915] hover:text-white"
                    >
                      Pilih Ukuran {recommendation}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
