'use client';

import { useState } from 'react';
import type { SizeChart } from '../../lib/pattern-jobs-api';
import type { DesignOption } from '../../lib/design-jobs-api';
import { createPatternJobAction } from './actions';

interface PatternFormClientProps {
  designOptions: DesignOption[];
  sizeCharts: SizeChart[];
}

export function PatternFormClient({ designOptions, sizeCharts }: PatternFormClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const approvedOptions = designOptions.filter((o) => o.status === 'approved');

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    const designOptionId = formData.get('designOptionId') as string;
    const sizeChartId = formData.get('sizeChartId') as string;

    try {
      await createPatternJobAction(designOptionId, sizeChartId);
      setMessage({ type: 'success', text: 'Pekerjaan pola berhasil masuk antrean.' });
      (document.getElementById('new-pattern-form') as HTMLFormElement).reset();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menjalankan pekerjaan pola.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <form id="new-pattern-form" action={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="design-option">Desain yang disetujui</label>
          <select id="design-option" name="designOptionId" required disabled={isSubmitting}>
            <option value="">Pilih desain</option>
            {approvedOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} ({option.candidateCode})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="size-chart">Tabel ukuran</label>
          <select id="size-chart" name="sizeChartId" required disabled={isSubmitting}>
            <option value="">Pilih tabel ukuran</option>
            {sizeCharts.map((chart) => (
              <option key={chart.id} value={chart.id}>
                {chart.name} ({chart.code})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menjalankan...' : 'Jalankan pekerjaan pola'}
          </button>
        </div>
      </form>
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
