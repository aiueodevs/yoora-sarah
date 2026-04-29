'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@yoora/ui/button';
import { Input } from '@yoora/ui/input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Kata sandi yang Anda masukkan belum sama.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="premium-page min-h-screen px-4 py-16 md:px-6 xl:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-28">
        <section className="premium-shell rounded-[2.5rem] p-8 md:p-10">
          <p className="premium-kicker">Buat akun</p>
          <h1 className="premium-title-xl mt-4">Bergabung untuk pengalaman belanja yang lebih rapi.</h1>
          <p className="premium-copy mt-5 max-w-xl">
            Dengan akun, Anda dapat menyimpan favorit, memantau status pesanan, dan mempercepat proses checkout pada pembelian berikutnya.
          </p>

          <div className="mt-8 space-y-4">
            <div className="premium-panel-soft rounded-[1.6rem] px-5 py-4">
              <p className="premium-kicker">Lebih praktis</p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                Alamat, kontak, dan ringkasan pesanan lebih mudah diakses saat dibutuhkan.
              </p>
            </div>
            <div className="premium-panel-soft rounded-[1.6rem] px-5 py-4">
              <p className="premium-kicker">Lebih nyaman</p>
              <p className="mt-3 text-sm leading-7 text-[#6f5b52]">
                Simpan koleksi favorit Anda dan lanjutkan belanja kapan saja tanpa mulai dari awal.
              </p>
            </div>
          </div>
        </section>

        <section className="premium-panel rounded-[2.5rem] p-8 md:p-10">
          <div>
            <p className="premium-kicker">Form pendaftaran</p>
            <h2 className="premium-title-md mt-4">Lengkapi data dasar untuk membuat akun.</h2>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#35241d]">
                Nama lengkap
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#35241d]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@domain.com"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#35241d]">
                Nomor telepon
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
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
                placeholder="Minimal 8 karakter"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#35241d]">
                Konfirmasi kata sandi
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang kata sandi"
                required
                className="premium-input mt-2 h-12 rounded-2xl border-0 bg-transparent px-4 text-[#241915] placeholder:text-[#8d776c]"
              />
            </div>

            <Button
              type="submit"
              className="premium-button-primary h-auto w-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] hover:brightness-110"
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Daftar'}
            </Button>

            <p className="text-center text-sm leading-7 text-[#6f5b52]">
              Data Anda digunakan untuk mempermudah proses pesanan dan komunikasi terkait pembelian.
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-[#6f5b52]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-[#35241d] hover:text-[#241915]">
              Masuk di sini
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
