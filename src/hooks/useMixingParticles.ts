import { useMemo } from 'react';

import { HeaderCharParticle, LetterParticle } from '../components/mixing/mixing.types';

const MIXING_TITLE = 'Mixing';
const MIXING_SUBTITLE = 'We are turning inputs into one result.';

function createLetterParticles(text1: string, text2: string): LetterParticle[] {
  const sourceChars = [...text1, ...text2]
    .filter((char) => char.trim().length > 0)
    .slice(0, 72);

  return sourceChars.map((char, index) => {
    const fromFirstText = index < Math.min(text1.replace(/\s+/g, '').length, sourceChars.length);
    const row = Math.floor(index / 12);
    const column = index % 12;
    const seed = ((char.charCodeAt(0) * 31 + index * 17) % 997) / 997;

    return {
      id: `${char}-${index}`,
      char,
      seed,
      initialX: -108 + column * 19,
      initialY: (fromFirstText ? -66 : 30) + row * 13,
      targetAngle: seed * Math.PI * 2 + index * 0.33,
      targetRadius: 44 + seed * 94,
      speed: 0.85 + seed * 1.35,
    };
  });
}

function createHeaderChars(): HeaderCharParticle[] {
  const titleChars = [...MIXING_TITLE].map((char, index) => ({
    id: `title-${index}-${char}`,
    char,
    line: 'title' as const,
    index,
    seed: ((char.charCodeAt(0) * 23 + index * 37) % 997) / 997,
  }));

  const subtitleChars = [...MIXING_SUBTITLE].map((char, index) => ({
    id: `subtitle-${index}-${char}`,
    char,
    line: 'subtitle' as const,
    index,
    seed: ((char.charCodeAt(0) * 17 + index * 31) % 997) / 997,
  }));

  return [...titleChars, ...subtitleChars];
}

export function useMixingParticles(text1: string, text2: string) {
  const particles = useMemo(() => createLetterParticles(text1, text2), [text1, text2]);
  const headerChars = useMemo(() => createHeaderChars(), []);

  return { particles, headerChars };
}
