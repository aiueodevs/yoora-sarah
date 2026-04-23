import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '6282315866088';
const DEFAULT_MESSAGE = 'Halo Yoora Sarah, saya ingin bertanya tentang produk...';

interface WhatsAppButtonProps {
  href?: string;
}

export function WhatsAppButton({ href }: WhatsAppButtonProps) {
  const waUrl = href ?? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 group flex items-center gap-3 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] px-4 py-3 text-white shadow-[0_14px_36px_rgba(18,140,126,0.32)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_48px_rgba(18,140,126,0.4)] md:px-5 md:py-3.5"
      aria-label="Chat via WhatsApp"
    >
      <MessageCircle className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
      <span className="hidden text-[0.78rem] font-semibold tracking-wide md:inline">
        Chat Kami
      </span>
    </a>
  );
}
