'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const messages = [
  'Bingung padu padan warna? Tanya AI Stylist Premium kami untuk rekomendasi gaya terbaik',
  'Temukan gaya personalmu yang elegan dengan asisten fashion pintar Yoora Sarah',
  'Dapatkan saran padu padan busana eksklusif dengan fitur AI Stylist Premium',
  'Jadikan setiap penampilan memukau dengan rekomendasi cerdas AI Stylist',
];

export function StylistMarquee() {
  const marqueeItems = [...messages, ...messages];

  return (
    <Link 
      href="/stylist" 
      className="absolute inset-x-0 bottom-0 z-30 block w-full overflow-hidden bg-[linear-gradient(135deg,rgba(255,248,244,0.32),rgba(255,240,232,0.14))] shadow-[0_-18px_45px_rgba(10,8,7,0.12)] backdrop-blur-[18px] transition-opacity hover:opacity-95"
    >
      <div className="flex whitespace-nowrap py-2.5 text-[0.62rem] uppercase tracking-[0.24em] text-[#fff8f3]/88">
        <div className="flex min-w-max items-center animate-marquee motion-reduce:animate-none [animation-direction:reverse] [will-change:transform] transform-gpu">
          {marqueeItems.map((message, index) => (
            <span key={`msg-${index}`} className="inline-flex items-center">
              <span className="px-6 inline-flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-[#fff8f3]/70" />
                {message}
              </span>
              <span aria-hidden="true" className="text-[#fff8f3]/44 px-2">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
