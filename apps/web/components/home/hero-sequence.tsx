'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const heroPoster = '/hero-sequence/ezgif-frame-001.jpg';
const heroVideoMp4 = '/hero-video/hero-original.mp4';

interface HeroSequenceProps {
  alt: string;
  mediaClassName?: string;
}

export function HeroSequence({ alt, mediaClassName = '' }: HeroSequenceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVideoReady(false);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const syncReadyState = () => {
      setIsVideoReady(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
    };

    syncReadyState();
    video.addEventListener('loadeddata', syncReadyState);
    video.addEventListener('canplay', syncReadyState);
    video.addEventListener('playing', syncReadyState);

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        setIsVideoReady(false);
      }
    };

    void playVideo();

    return () => {
      video.removeEventListener('loadeddata', syncReadyState);
      video.removeEventListener('canplay', syncReadyState);
      video.removeEventListener('playing', syncReadyState);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <Image
        src={heroPoster}
        alt={alt}
        fill
        priority
        unoptimized
        sizes="100vw"
        className={`object-cover object-center ${mediaClassName}`.trim()}
      />
      {!prefersReducedMotion ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroPoster}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden ${mediaClassName} ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`.trim()}
        >
          <source src={heroVideoMp4} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
