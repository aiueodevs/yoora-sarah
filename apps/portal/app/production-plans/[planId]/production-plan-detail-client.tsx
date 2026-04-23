'use client';

import { useState } from 'react';

import type { ProductionPlan, ProductionPlanLine } from '../../../lib/forecast-api';
import type { Style } from '../../../lib/internal-api';
import { formatPortalNumber, formatPortalToken } from '../../../lib/portal-copy';
import {
  addProductionPlanLineAction,
  updateProductionPlanStatusAction,
} from './actions';

interface ProductionPlanDetailClientProps {
  initialPlan: ProductionPlan;
  initialLines: ProductionPlanLine[];
  styles: Style[];
}

function parseStyleId(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const numericPortion = normalized.includes('_')
    ? normalized.split('_').at(-1) ?? ''
    : normalized;
  const parsed = Number.parseInt(numericPortion, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function ProductionPlanDetailClient({
  initialPlan,
  initialLines,
  styles,
}: ProductionPlanDetailClientProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [lines, setLines] = useState(initialLines);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newStyleId, setNewStyleId] = useState<string>('');
  const [newSizeCode, setNewSizeCode] = useState<string>('');
  const [newColorCode, setNewColorCode] = useState<string>('');
  const [newPlannedUnits, setNewPlannedUnits] = useState<number>(0);
  const [newChannelCode, setNewChannelCode] = useState<string>('');

  async function handleAddLine() {
    if (!newSizeCode || !newColorCode || newPlannedUnits <= 0) {
      setMessage({ type: 'error', text: 'Lengkapi semua kolom wajib terlebih dahulu.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const snapshot = await addProductionPlanLineAction({
        planId: plan.production_plan_id,
        styleId: parseStyleId(newStyleId),
        sizeCode: newSizeCode.trim(),
        colorCode: newColorCode.trim(),
        plannedUnits: newPlannedUnits,
        channelCode: newChannelCode.trim() || undefined,
      });
      setPlan(snapshot.plan);
      setLines(snapshot.lines);
      setMessage({ type: 'success', text: 'Baris rencana berhasil ditambahkan.' });
      setNewStyleId('');
      setNewSizeCode('');
      setNewColorCode('');
      setNewPlannedUnits(0);
      setNewChannelCode('');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menambahkan baris rencana.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setSaving(true);
    setMessage(null);

    try {
      const snapshot = await updateProductionPlanStatusAction({
        planId: plan.production_plan_id,
        status: newStatus,
        plannerNotes: plan.planner_notes,
      });
      setPlan(snapshot.plan);
      setLines(snapshot.lines);
      setMessage({ type: 'success', text: `Status berubah menjadi ${formatPortalToken(newStatus)}.` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal memperbarui status rencana.' });
    } finally {
      setSaving(false);
    }
  }

  const totalUnits = lines.reduce((sum, line) => sum + line.planned_units, 0);

  return (
    <main className="page-shell page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Detail Rencana Produksi</span>
          <h1>Rencana produksi #{plan.production_plan_id}</h1>
          <p>
            Run forecast #{plan.forecast_run_id} •{' '}
            <span className={`status-badge status-${plan.status}`}>{formatPortalToken(plan.status)}</span>
          </p>
        </div>
      </section>

      {(plan.status === 'draft' || plan.status === 'review') && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Tambah Baris Rencana</h2>
          </div>
          <div className="card">
            <div className="form-grid">
              <div className="form-group">
                <label>Style (opsional)</label>
                <select value={newStyleId} onChange={(e) => setNewStyleId(e.target.value)}>
                  <option value="">Pilih style</option>
                  {styles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name} ({style.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Kode ukuran *</label>
                <input
                  type="text"
                  value={newSizeCode}
                  onChange={(e) => setNewSizeCode(e.target.value)}
                  placeholder="Contoh: S, M, L, XL"
                  required
                />
              </div>
              <div className="form-group">
                <label>Kode warna *</label>
                <input
                  type="text"
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  placeholder="Contoh: BK, NV, RD"
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit direncanakan *</label>
                <input
                  type="number"
                  value={newPlannedUnits}
                  onChange={(e) => setNewPlannedUnits(Number.parseInt(e.target.value, 10) || 0)}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Channel (opsional)</label>
                <input
                  type="text"
                  value={newChannelCode}
                  onChange={(e) => setNewChannelCode(e.target.value)}
                  placeholder="Contoh: DTC, Wholesale"
                />
              </div>
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddLine}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Tambah baris'}
                </button>
              </div>
            </div>
            {message ? <div className={`message message-${message.type}`}>{message.text}</div> : null}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Baris Rencana ({lines.length})</h2>
          <p className="total-units">Total: {formatPortalNumber(totalUnits)} unit</p>
        </div>
        {lines.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada baris rencana. Tambahkan baris di bagian atas.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Style</th>
                  <th>Ukuran</th>
                  <th>Warna</th>
                  <th>Unit</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.production_plan_line_id}>
                    <td>{line.style_id || '-'}</td>
                    <td>{line.size_code}</td>
                    <td>{line.color_code}</td>
                    <td>{formatPortalNumber(line.planned_units)}</td>
                    <td>{line.channel_code || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Aksi</h2>
        </div>
        <div className="card actions-card">
          {plan.status === 'draft' ? (
            <button
              className="btn btn-primary"
              onClick={() => handleStatusChange('review')}
              disabled={saving}
            >
              Ajukan untuk review
            </button>
          ) : null}
          {plan.status === 'review' ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => handleStatusChange('approved')}
                disabled={saving}
              >
                Setujui rencana
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleStatusChange('rejected')}
                disabled={saving}
              >
                Tolak
              </button>
            </>
          ) : null}
          {plan.status === 'approved' ? (
            <button
              className="btn btn-primary"
              onClick={() => handleStatusChange('released')}
              disabled={saving}
            >
              Rilis ke produksi
            </button>
          ) : null}
          {plan.status === 'released' ? (
            <div className="released-notice">Rencana ini sudah dirilis ke produksi.</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
