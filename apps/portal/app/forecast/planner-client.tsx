'use client';

import { useState } from 'react';
import { createForecastRunAction } from './actions';
import type { Collection } from '../../lib/internal-api';

interface PlannerClientProps {
  collections: Collection[];
}

export function PlannerClient({ collections }: PlannerClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    const collectionId = parseInt(formData.get('collectionId') as string, 10);

    try {
      await createForecastRunAction(collectionId);
      setMessage({ type: 'success', text: 'Forecast berhasil masuk antrean.' });
      (document.getElementById('new-forecast-form') as HTMLFormElement).reset();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menjalankan forecast.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <form id="new-forecast-form" action={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="collection">Koleksi target</label>
          <select id="collection" name="collectionId" required disabled={isSubmitting}>
            <option value="">Pilih koleksi</option>
            {collections
              .filter((c) => c.status === 'active')
              .map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name} ({collection.code})
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menjalankan...' : 'Jalankan forecast'}
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
