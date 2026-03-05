import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { LetterParticle } from './mixing.types';

type AnimatedLetterProps = {
  particle: LetterParticle;
  motionProgress: SharedValue<number>;
  resolveProgress: SharedValue<number>;
};

export function AnimatedLetter({
  particle,
  motionProgress,
  resolveProgress,
}: AnimatedLetterProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const phase = motionProgress.value * Math.PI * 2;
    const baseMix = 0.5 - 0.5 * Math.cos(phase);
    const splitMix = Math.pow(baseMix, 1.15);

    const angle = particle.targetAngle + phase * particle.speed;
    const circleX = Math.cos(angle) * particle.targetRadius;
    const circleY = Math.sin(angle) * (particle.targetRadius * 0.58);
    const bob = Math.sin(phase * 2 + particle.seed * Math.PI * 2) * 22;
    const jitterX = Math.sin(phase * 3 + particle.seed * Math.PI * 6) * 10;
    const jitterY = Math.cos(phase * 2 + particle.seed * Math.PI * 4) * 12;

    const idleBlink =
      0.62 +
      0.28 *
        (0.5 + 0.5 * Math.sin(phase + particle.seed * Math.PI * 2));
    const movingBlink =
      0.2 +
      0.18 *
        (0.5 + 0.5 * Math.sin(phase * 4 + particle.seed * Math.PI * 4));
    const mixSmooth = splitMix * splitMix * (3 - 2 * splitMix);
    const baseOpacity = idleBlink * (1 - mixSmooth) + movingBlink * mixSmooth;
    const fallSpeed = 0.82 + particle.seed * 0.78;
    const fall = Math.min(1, resolveProgress.value * fallSpeed);
    const fallY = Math.pow(fall, 1.35) * (420 + particle.seed * 260);
    const driftX = (particle.seed - 0.5) * 92 * fall;
    const swayX =
      Math.sin(fall * Math.PI * (2 + particle.seed * 1.7) + particle.seed * 9) *
      16 *
      fall;
    const fadeStart = 0.62 + particle.seed * 0.12;
    const fadeWindow = 1 - fadeStart;
    const fadeProgress = fadeWindow <= 0 ? 1 : Math.max(0, (fall - fadeStart) / fadeWindow);
    const fade = 1 - fadeProgress;
    const opacity = baseOpacity * fade;

    const dynamicX = particle.initialX + (circleX + jitterX - particle.initialX) * splitMix;
    const dynamicY =
      particle.initialY +
      (circleY + jitterY - particle.initialY) * splitMix +
      bob * splitMix;

    return {
      opacity,
      transform: [
        { translateX: dynamicX + driftX + swayX },
        { translateY: dynamicY + fallY },
        { scale: 1 - 0.18 * fall },
      ],
    };
  });

  return <Animated.Text style={[styles.letter, animatedStyle]}>{particle.char}</Animated.Text>;
}

const styles = StyleSheet.create({
  letter: {
    position: 'absolute',
    color: '#DCE7FF',
    fontSize: 16,
    fontWeight: '700',
  },
});
