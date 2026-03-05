import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { TextCaptureCard } from '../components/TextCaptureCard';
import { TextPill } from '../components/TextPill';
import { useSavedBadge } from '../hooks/useSavedBadge';
import { MIX_MODE_OPTIONS, MixMode } from '../types/mixMode';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Text2'>;

export function Text2Screen({ route, navigation }: Props) {
  const { text1 } = route.params;
  const [text2, setText2] = useState('');
  const [mode, setMode] = useState<MixMode>('style-transfer');
  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const hasText = useMemo(() => text2.trim().length > 0, [text2]);
  const pillScale = useSharedValue(0.82);
  const pillOpacity = useSharedValue(0);
  const { savedBadgeStyle } = useSavedBadge(text2, isAudioRecording);

  useEffect(() => {
    pillScale.value = 0.82;
    pillOpacity.value = 0;

    pillScale.value = withDelay(
      360,
      withSpring(1, {
        damping: 14,
        stiffness: 180,
        mass: 0.75,
        overshootClamping: false,
      }),
    );
    pillOpacity.value = withDelay(360, withTiming(1, { duration: 240 }));
  }, [pillOpacity, pillScale]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  return (
    <ScreenShell
      title="Text 2"
      subtitle="Add the second text. We will use it as the style and tone for the blend."
      scroll
      withKeyboard
      footer={
        <>
          <Image source={require('../images/2.png')} style={styles.screenLogo} />
          <PrimaryButton
            title="Mix them"
            disabled={!hasText}
            onPress={() =>
              navigation.navigate('Mixing', {
                text1,
                text2: text2.trim(),
                mode,
              })
            }
          />
        </>
      }
    >
      <View>
        <Animated.View style={[styles.pillWrap, pillAnimatedStyle]}>
          <TextPill label="Text 1" text={text1} />
        </Animated.View>

        <View style={styles.inputWrap}>
          <TextCaptureCard
            value={text2}
            onChange={setText2}
            placeholder="Write your second text here..."
            onRecordingStateChange={setIsAudioRecording}
          />

          <Animated.View style={[styles.savedBadge, savedBadgeStyle]}>
            <Text style={styles.savedLabel}>✓</Text>
          </Animated.View>
        </View>

        <View style={styles.modeSection}>
          <Text style={styles.modeTitle}>Mix mode</Text>
          <View style={styles.modeGrid}>
            {MIX_MODE_OPTIONS.map((option) => {
              const selected = option.value === mode;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setMode(option.value)}
                  style={[styles.modeCard, selected && styles.modeCardSelected]}
                >
                  <Text style={[styles.modeCardTitle, selected && styles.modeCardTitleSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pillWrap: {
    marginBottom: 12,
  },
  inputWrap: {
    position: 'relative',
  },
  savedBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  savedLabel: {
    color: '#73D9A2',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
  },
  modeSection: {
    marginTop: 14,
    gap: 10,
  },
  modeTitle: {
    color: '#C7D7FF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modeGrid: {
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modeCard: {
    borderWidth: 1,
    borderColor: '#2E3E6E',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(12, 20, 45, 0.7)',
    gap: 5,
  },
  modeCardSelected: {
    borderColor: '#5F80E0',
    backgroundColor: 'rgba(42, 67, 128, 0.45)',
  },
  modeCardTitle: {
    color: '#DCE7FF',
    fontSize: 15,
    fontWeight: '700',
  },
  modeCardTitleSelected: {
    color: '#F2F6FF',
  },
  modeCardDescription: {
    color: '#AFC0EE',
    fontSize: 12,
    lineHeight: 17,
  },
  modeCardDescriptionSelected: {
    color: '#DCE8FF',
  },
  screenLogo: {
    position: 'absolute',
    width: 150,
    height: 60,
    right: 12,
    top: -22,
    transform: [{ rotateZ: '4deg' }],
    zIndex: 1,
  },
});
