import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedHeaderChar } from '../components/mixing/AnimatedHeaderChar';
import { AnimatedLetter } from '../components/mixing/AnimatedLetter';
import { ScreenShell } from '../components/ScreenShell';
import { useMixingParticles } from '../hooks/useMixingParticles';
import { mixTextWithAI } from '../services/mixText';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Mixing'>;

const MIN_MIXING_MS = 10000;
const RESOLVE_DURATION_MS = 5200;
const M_FALL_START = 0.92;
const M_FALL_ACCELERATION = 2.6;
const M_FALL_DONE_PROGRESS = M_FALL_START + ((1 / M_FALL_ACCELERATION) * (1 - M_FALL_START));
const SPINNER_RADIUS = 151;
const SPINNER_TAIL_DOTS = Array.from({ length: 14 }, (_, index) => {
  const angleDeg = -index * 7;
  const angle = (angleDeg * Math.PI) / 180;
  const progress = index / 13;

  return {
    key: `dot-${index}`,
    x: Math.cos(angle) * SPINNER_RADIUS,
    y: Math.sin(angle) * SPINNER_RADIUS,
    opacity: 1 - progress * 0.9,
    size: 7 - progress * 3,
  };
});

export function MixingScreen({ route, navigation }: Props) {
  const { text1, text2, mode } = route.params;
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(10);

  const motionProgress = useSharedValue(0);
  const spinnerProgress = useSharedValue(0);
  const resolveProgress = useSharedValue(0);

  const { particles, headerChars } = useMixingParticles(text1, text2);

  useEffect(() => {
    motionProgress.value = 0;
    resolveProgress.value = 0;
    motionProgress.value = withRepeat(
      withTiming(1, {
        duration: 7200,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    spinnerProgress.value = 0;
    spinnerProgress.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [motionProgress, resolveProgress, spinnerProgress]);

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: resolveProgress.value > 0.01 ? 0 : 1,
    transform: [{ rotate: `${spinnerProgress.value * 360}deg` }],
  }));

  useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, Math.ceil((MIN_MIXING_MS - elapsed) / 1000));
      setSecondsLeft(left);
    }, 250);

    const runMixing = async () => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const resultPromise = mixTextWithAI(text1, text2, mode);
        await new Promise((resolve) => setTimeout(resolve, MIN_MIXING_MS));
        const result = await resultPromise;

        if (!isMounted) {
          return;
        }

        clearInterval(intervalId);
        resolveProgress.value = withTiming(1, {
          duration: RESOLVE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });

        const resolveTimeToMFallDone =
          (1 - Math.pow(1 - M_FALL_DONE_PROGRESS, 1 / 3)) * RESOLVE_DURATION_MS;
        await new Promise((resolve) => setTimeout(resolve, resolveTimeToMFallDone + 50));

        if (!isMounted) {
          return;
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace('Result', { text1, text2, result });
      } catch {
        if (!isMounted) {
          return;
        }

        clearInterval(intervalId);
        setError('Mixing failed. Please try again.');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    runMixing();

    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, [mode, navigation, resolveProgress, text1, text2]);

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.headerOverlay}>
          <View style={styles.headerLineTitle}>
            {headerChars
              .filter((particle) => particle.line === 'title')
              .map((particle) => (
                <AnimatedHeaderChar
                  key={particle.id}
                  particle={particle}
                  resolveProgress={resolveProgress}
                  mFallStart={M_FALL_START}
                  mFallAcceleration={M_FALL_ACCELERATION}
                />
              ))}
          </View>
          <View style={styles.headerLineSubtitle}>
            {headerChars
              .filter((particle) => particle.line === 'subtitle')
              .map((particle) => (
                <AnimatedHeaderChar
                  key={particle.id}
                  particle={particle}
                  resolveProgress={resolveProgress}
                  mFallStart={M_FALL_START}
                  mFallAcceleration={M_FALL_ACCELERATION}
                />
              ))}
          </View>
        </View>

        <View style={styles.mixingZone}>
          <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
            {SPINNER_TAIL_DOTS.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.spinnerDot,
                  {
                    opacity: dot.opacity,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    transform: [{ translateX: dot.x }, { translateY: dot.y }],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {particles.map((particle) => (
            <AnimatedLetter
              key={particle.id}
              particle={particle}
              motionProgress={motionProgress}
              resolveProgress={resolveProgress}
            />
          ))}
        </View>
        {error && <Text style={styles.status}>{error}</Text>}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  headerOverlay: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    alignItems: 'flex-start',
    gap: 10,
  },
  headerLineTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  headerLineSubtitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  mixingZone: {
    width: 320,
    height: 320,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  spinnerContainer: {
    position: 'absolute',
    width: 312,
    height: 312,
    borderRadius: 156,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerDot: {
    position: 'absolute',
    backgroundColor: '#8AA2FF',
  },
  status: {
    color: '#C5D1F3',
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 300,
  },
});
