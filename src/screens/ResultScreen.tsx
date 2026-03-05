import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { useResultPlayback } from '../hooks/useResultPlayback';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ route, navigation }: Props) {
  const { result } = route.params;
  const [visibleLength, setVisibleLength] = useState(0);
  const { isPreparingAudio, isPlaying, handleListenPress } = useResultPlayback(result);

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= result.length) {
          clearInterval(id);
          return prev;
        }

        return prev + 1;
      });
    }, 35);

    return () => clearInterval(id);
  }, [result]);

  const visibleText = useMemo(() => result.slice(0, visibleLength), [result, visibleLength]);

  return (
    <ScreenShell
      title="Result"
      footer={
        <>
          <Image source={require('../images/3.png')} style={styles.screenLogo} />
          <PrimaryButton
            title="Mix again"
            onPress={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Text1' }],
                }),
              )
            }
          />
        </>
      }
    >
      <View style={styles.wrapper}>
        <Animated.View entering={FadeInUp.duration(550).springify()} style={styles.card}>
          <Text style={styles.label}>Your blend</Text>
          <Text style={styles.result}>{visibleText}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Stop audio' : 'Listen to result'}
            onPress={handleListenPress}
            disabled={isPreparingAudio}
            style={({ pressed }) => [
              styles.listenIcon,
              isPreparingAudio && styles.listenIconDisabled,
              pressed && !isPreparingAudio && styles.listenIconPressed,
            ]}
          >
            {isPreparingAudio ? (
              <ActivityIndicator color="#F2F6FF" size="small" />
            ) : (
              <Text style={styles.listenIconGlyph}>{isPlaying ? '■' : '▶'}</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: 18,
    paddingBottom: 50,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2F4274',
    backgroundColor: 'rgba(12, 20, 45, 0.88)',
    borderRadius: 22,
    padding: 18,
    paddingBottom: 72,
  },
  label: {
    color: '#AAC1FF',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  result: {
    color: '#F2F6FF',
    fontSize: 18,
    lineHeight: 28,
  },
  listenIcon: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A63A5',
    backgroundColor: 'rgba(54, 86, 158, 0.9)',
  },
  listenIconDisabled: {
    opacity: 0.8,
  },
  listenIconPressed: {
    transform: [{ scale: 0.94 }],
  },
  listenIconGlyph: {
    color: '#F2F6FF',
    fontSize: 20,
    fontWeight: '700',
  },
  screenLogo: {
    position: 'absolute',
    width: 60,
    height: 100,
    left: 12,
    top: -72,
    zIndex: 1,
  },
});
