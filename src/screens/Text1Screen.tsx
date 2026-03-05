import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { TextCaptureCard } from '../components/TextCaptureCard';
import { useSavedBadge } from '../hooks/useSavedBadge';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Text1'>;

export function Text1Screen({ navigation }: Props) {
  const [text1, setText1] = useState('');
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const hasText = useMemo(() => text1.trim().length > 0, [text1]);
  const { savedBadgeStyle } = useSavedBadge(text1, isAudioRecording);

  return (
    <ScreenShell
      title="Text 1"
      subtitle="Capture the first thought. Keep it simple: one sentence or a short paragraph."
      scroll
      withKeyboard
      footer={
        <>
          <Image source={require('../images/1.png')} style={styles.screenLogo} />
          <PrimaryButton
            title="Continue"
            disabled={!hasText}
            onPress={() => navigation.navigate('Text2', { text1: text1.trim() })}
          />
        </>
      }
    >
      <View style={styles.inputWrap}>
        <TextCaptureCard
          value={text1}
          onChange={setText1}
          placeholder="Write your first text here..."
          onRecordingStateChange={setIsAudioRecording}
        />
        <Animated.View style={[styles.savedBadge, savedBadgeStyle]}>
          <Text style={styles.savedLabel}>✓</Text>
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  screenLogo: {
    position: 'absolute',
    width: 60,
    height: 100,
    right: 12,
    top: -68,
    transform: [{ rotateY: '180deg' }],
    zIndex: 1,
  },
});
