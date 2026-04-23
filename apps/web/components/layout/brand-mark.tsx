import Link from 'next/link';
import Image from 'next/image';

interface BrandMarkProps {
  className?: string;
  light?: boolean;
}

export function BrandMark({ className = '', light = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 ${className}`.trim()}
      aria-label="Yoora Sarah"
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-full">
        <Image
          src="https://www.yoorasarah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-topbar.08em~oeq_vqsv.png&w=3840&q=75&dpl=dpl_E6iLp5xSGbcp4otPmSfkhG3LN4hJ"
          alt="Yoora Sarah"
          fill
          sizes="56px"
          className="object-contain"
        />
      </div>
    </Link>
  );
}
