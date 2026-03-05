import { StyleSheet } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { HeaderCharParticle } from './mixing.types';

type AnimatedHeaderCharProps = {
  particle: HeaderCharParticle;
  resolveProgress: SharedValue<number>;
  mFallStart: number;
  mFallAcceleration: number;
};

export function AnimatedHeaderChar({
  particle,
  resolveProgress,
  mFallStart,
  mFallAcceleration,
}: AnimatedHeaderCharProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isLeadM = particle.line === 'title' && particle.index === 0;
    const phaseProgress = resolveProgress.value;
    const fallSpeed = 0.82 + particle.seed * 0.78;
    const baseFall = Math.min(1, phaseProgress * fallSpeed);

    const mHoldEnd = 0.68;
    const mBounceEnd = 0.76;

    const mBounceProgress = Math.max(
      0,
      Math.min(1, (phaseProgress - mHoldEnd) / (mBounceEnd - mHoldEnd)),
    );
    const mFallProgress = Math.max(
      0,
      Math.min(1, (phaseProgress - mFallStart) / (1 - mFallStart)),
    );
    const mFastFall = Math.min(1, mFallProgress * mFallAcceleration);

    const fall = isLeadM ? mFastFall : baseFall;

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

    const preMDisappear = 1 - Math.max(0, Math.min(1, (phaseProgress - 0.24) / 0.1));
    const opacity = isLeadM ? 1 - Math.max(0, (fall - 0.72) / 0.28) : fade * preMDisappear;
    const scaleBase = particle.line === 'title' ? 1 : 0.94;

    const mLeanProgress = mBounceProgress * mBounceProgress * (3 - 2 * mBounceProgress);
    const mTiltDeg = isLeadM ? 4.5 * mLeanProgress * (1 - fall) : 0;
    const mNudgeX = isLeadM ? 2.8 * mLeanProgress * (1 - fall) : 0;
    const mNudgeY = isLeadM ? 1.8 * mLeanProgress * (1 - fall) : 0;

    return {
      opacity,
      transform: [
        { translateX: driftX + swayX + mNudgeX },
        { translateY: fallY + mNudgeY },
        { rotateZ: `${mTiltDeg}deg` },
        { scale: scaleBase * (1 - 0.18 * fall) },
      ],
    };
  });

  return (
    <Animated.Text
      style={[
        particle.line === 'title' ? styles.headerTitleChar : styles.headerSubtitleChar,
        animatedStyle,
      ]}
    >
      {particle.char === ' ' ? '\u00A0' : particle.char}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  headerTitleChar: {
    color: '#EAF0FF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitleChar: {
    color: '#AFC0ED',
    fontSize: 16,
    lineHeight: 22,
  },
});
