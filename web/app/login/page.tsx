'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@yoora/ui/button';
import { Input } from '@yoora/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="premium-page min-h-screen px-4 py-16 md:px-6 xl:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-28">
        <section className="premium-shell rounded-[2.5rem] p-8 md:p-10">
          <p className="premium-kicker">Masuk akun</p>
          <h1 className="premium-title-xl mt-4">Akses kembali ke akun belanja Anda.</h1>
          <p className="premium-copy mt-5 max-w-xl">
            Masuk untuk melihat pesanan, wishlist, alamat tersimpan, dan ringkasan belanja terakhir dalam satu ruang.
          </p>

          <div className="mt-8 space-y-4">
            <div className="premium-panel-soft rounded-[1.6rem] px-5 py-4">
              <p className="premium-kicker">Praktis</p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                Lanjutkan belanja tanpa perlu mengisi data yang sama berulang kali.
              </p>
            </div>
            <div className="premium-panel-soft rounded-[1.6rem] px-5 py-4">
              <p className="premium-kicker">Lebih tertata</p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                Cek status pesanan, simpan favorit, dan lanjut checkout dengan lebih cepat.
              </p>
            </div>
          </div>
        </section>

        <section className="premium-panel rounded-[2.5rem] p-8 md:p-10">
          <div>
            <p className="premium-kicker">Form login</p>
            <h2 className="premium-title-md mt-4">Masuk dengan email atau nomor telepon.</h2>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#35241d]">
                Email atau nomor telepon
              </label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@domain.com atau 08xxxxxxxxxx"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#35241d]">
                Kata sandi
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-[#6f5b52]">Gunakan data yang terdaftar saat membuat akun.</p>
              <Link href="/forgot-password" className="text-sm text-[#5a4338] hover:text-[#241915]">
                Lupa kata sandi?
              </Link>
            </div>

            <Button
              type="submit"
              className="premium-button-primary h-auto w-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] hover:brightness-110"
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6f5b52]">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-[#35241d] hover:text-[#241915]">
              Buat akun di sini
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
