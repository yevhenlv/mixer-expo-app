export type LetterParticle = {
  id: string;
  char: string;
  seed: number;
  initialX: number;
  initialY: number;
  targetAngle: number;
  targetRadius: number;
  speed: number;
};

export type HeaderCharParticle = {
  id: string;
  char: string;
  line: 'title' | 'subtitle';
  index: number;
  seed: number;
};
