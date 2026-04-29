'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  name,
  price,
  image,
  quantity,
  color,
  size,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="premium-panel hover-lift flex flex-col gap-5 rounded-[2rem] p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="relative h-28 w-full overflow-hidden rounded-[1.5rem] bg-[rgba(240,230,221,0.72)] sm:h-32 sm:w-28 sm:flex-shrink-0">
        <Image src={image} alt={name} fill className="object-cover transition duration-700 hover:scale-[1.03]" />
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="premium-kicker">
              Pilihan siap beli
            </p>
            <h3 className="mt-2 font-display text-[2rem] leading-none text-[#261a16]">{name}</h3>
          </div>
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="premium-button-secondary inline-flex h-11 w-11 items-center justify-center text-[#7a6357] transition hover:border-[rgba(115,70,59,0.22)] hover:text-[#73463b]"
            aria-label={`Hapus ${name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#7c665b]">
          {color ? (
            <span className="premium-pill px-3 py-2">Warna {color}</span>
          ) : null}
          {size ? (
            <span className="premium-pill px-3 py-2">Ukuran {size}</span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-medium text-[#35241d]">
            Rp{price.toLocaleString('id-ID')}
          </p>
          <div className="premium-panel-soft inline-flex items-center rounded-full p-1">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#241915] transition hover:bg-white/90"
              onClick={() => onUpdateQuantity(id, quantity - 1)}
              disabled={quantity <= 1}
              aria-label={`Kurangi jumlah ${name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-[#241915]">
              {quantity}
            </span>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#241915] transition hover:bg-white/90"
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              aria-label={`Tambah jumlah ${name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
