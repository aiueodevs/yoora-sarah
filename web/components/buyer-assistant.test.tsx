import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BuyerAssistant } from './buyer-assistant';
import { vi } from 'vitest';

vi.mock('@/lib/buyer-ai-api', () => ({
  getAssistantResponse: vi.fn(),
}));

vi.mock('@/telemetry/actions', () => ({
  recordBuyerEventAction: vi.fn().mockResolvedValue(undefined),
}));

import { getAssistantResponse } from '@/lib/buyer-ai-api';

describe('BuyerAssistant', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders a WhatsApp action CTA when the assistant response includes actions', async () => {
    vi.mocked(getAssistantResponse).mockResolvedValue({
      content: 'Untuk kasus ini, saya sarankan tim kami membantu langsung.',
      actions: [
        {
          key: 'whatsapp_handoff',
          label: 'Chat CS via WhatsApp',
          href: 'https://wa.me/6282315866088?text=test',
          kind: 'whatsapp',
        },
      ],
      sources: null,
      mode: 'fallback',
    });

    render(<BuyerAssistant />);

    fireEvent.click(screen.getByLabelText(/Buka asisten belanja/i));
    fireEvent.change(screen.getByPlaceholderText(/Tulis pesan Anda/i), {
      target: { value: 'Saya ingin komplain soal pesanan saya' },
    });
    fireEvent.submit(screen.getByPlaceholderText(/Tulis pesan Anda/i).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Chat CS via WhatsApp')).toBeInTheDocument();
    });
  });
});

export {};
