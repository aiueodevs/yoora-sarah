import { ShieldCheck, Truck, Heart } from 'lucide-react';
import Image from 'next/image';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Kualitas Terjaga',
    description: 'Setiap produk dipilih dan dikurasi dengan standar yang tinggi untuk memastikan kenyamanan dan keanggunan.',
  },
  {
    icon: Truck,
    title: 'Pengiriman Aman',
    description: 'Diproses dari Jawa Barat dengan pembaruan status langsung ke WhatsApp Anda.',
  },
  {
    icon: Heart,
    title: 'Layanan Personal',
    description: 'Tim support yang siap membantu, dari pemilihan ukuran hingga styling advice.',
  },
];

/* Use real product images from the catalog as editorial visuals */
const editorialImages = [
  'https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png',
  'https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg',
  'https://yoorasarah-products.fly.storage.tigris.dev/products/20260312_020329_bede5d09.jpg',
];

export default function AboutPage() {
  return (
    <main className="premium-page min-h-[100dvh] pt-24 pb-20">
      <div className="mx-auto max-w-[92rem] px-4 md:px-6 xl:px-10">
        
        {/* Editorial Header */}
        <div className="mx-auto max-w-4xl text-center mb-20 mt-10">
          <p className="premium-kicker tracking-[0.3em] text-[#8a6c5f]">Tentang Yoora Sarah</p>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] tracking-[-0.04em] text-[#241915] md:text-5xl lg:text-7xl">
            Busana muslimah yang berbicara lewat kehalusan.
          </h1>
          <p className="premium-copy mx-auto mt-8 max-w-2xl text-[1.1rem] leading-[1.9] text-[#5f4a41]">
            Yoora Sarah hadir untuk perempuan yang menghargai detail. Setiap
            koleksi dirancang dengan perhatian penuh pada kenyamanan bahan,
            keindahan warna, dan siluet yang membuat Anda tampil percaya diri
            di setiap momen.
          </p>
        </div>

        {/* Editorial Image Grid — 3 real product photos */}
        <div className="mx-auto mb-20 grid max-w-6xl gap-4 sm:grid-cols-3 sm:gap-6">
          {editorialImages.map((src, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-[2rem] bg-[#e6dfd8] ${
                idx === 0 ? 'aspect-[3/4] sm:row-span-2' : 'aspect-square'
              }`}
            >
              <Image
                src={src}
                alt={`Koleksi Yoora Sarah ${idx + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(24,16,12,0.24)] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Brand Promise Section */}
        <div className="premium-shell overflow-hidden rounded-[2.5rem] bg-[rgba(255,253,250,0.7)] shadow-[0_40px_100px_rgba(58,39,28,0.06)] p-10 md:p-16 lg:p-20">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="https://image.mux.com/74ImaAc01KFL02yvU9XO3QiiYSCrYnrDybRYgBnVdzvuU/thumbnail.webp?time=0&width=1280"
                alt="Koleksi Yoora Sarah - Editorial"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[center_18%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(24,16,12,0.16)] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-full border border-white/30 bg-[rgba(255,251,247,0.2)] px-4 py-2 text-[0.55rem] uppercase tracking-[0.3em] text-white backdrop-blur-xl">
                Yoora Sarah Studio
              </div>
            </div>

            <div className="flex flex-col justify-center">
               <h2 className="font-display text-3xl tracking-[-0.03em] text-[#241915] md:text-4xl">
                 Komitmen Kami
               </h2>
               <p className="mt-6 text-[1.05rem] leading-[2] text-[#6f5b52]">
                 Kami percaya bahwa keanggunan tidak harus mengorbankan kenyamanan. Dari pemilihan kain hingga potongan akhir, kami memastikan bahwa setiap jahitan tidak hanya terlihat indah, tetapi juga terasa nyaman dikenakan sepanjang hari.
               </p>
               <p className="mt-4 text-[1.05rem] leading-[2] text-[#6f5b52]">
                 Yoora Sarah bukanlah tentang tren sesaat, melainkan tentang menciptakan koleksi esensial yang akan terus relevan dan menemani berbagai babak dalam hidup Anda.
               </p>

               <div className="mt-12 space-y-8">
                 {trustItems.map((item) => (
                    <div key={item.title} className="flex items-start gap-5">
                       <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2822] to-[#241915] shadow-lg">
                         <item.icon className="h-6 w-6 text-[#fff7f2]" />
                       </div>
                       <div>
                         <h3 className="text-[1.1rem] font-bold text-[#241915] font-display">{item.title}</h3>
                         <p className="mt-1 text-[0.95rem] leading-7 text-[#6f5b52]">{item.description}</p>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
