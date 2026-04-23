import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'One Set | Coming Soon | Yoora Sarah',
  description: 'Koleksi One Set eksklusif dari Yoora Sarah akan segera hadir.',
};

export default function OneSetComingSoonPage() {
  return (
    <div className="premium-page min-h-screen bg-[#faf8f6] flex flex-col items-center justify-center pt-20 px-4 md:px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#f4ede7] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-1/4 right-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#f5efe9] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-[#f4ede7] text-[#8a6c5f]">
          <Sparkles className="h-7 w-7" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-[0.7rem] uppercase tracking-[0.3em] text-[#a2806e] mb-4 font-semibold">
          Koleksi Eksklusif
        </h3>
        
        <h1 className="font-display text-5xl md:text-6xl tracking-[-0.03em] text-[#1a110e] mb-6">
          Coming Soon
        </h1>
        
        <p className="text-[1.05rem] leading-relaxed text-[#5f4a41] mb-10 max-w-lg">
          Koleksi One Set dari Yoora Sarah sedang dalam tahap kurasi dan persiapan. 
          Nantikan paduan busana premium yang didesain khusus untuk melengkapi gaya elegan Anda.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 border border-[#241915] bg-transparent text-[#241915] px-8 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] font-medium hover:bg-[#241915] hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
