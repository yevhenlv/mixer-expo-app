import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';

import { synthesizeSpeechWithElevenLabs } from '../services/synthesizeSpeech';

export function useResultPlayback(rawResult: string) {
  const [ttsSource, setTtsSource] = useState<string | null>(null);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [playPending, setPlayPending] = useState(false);

  const player = useAudioPlayer(ttsSource);
  const playerStatus = useAudioPlayerStatus(player);
  const speakableResult = useMemo(() => extractSpeakableResult(rawResult), [rawResult]);

  const safelyPause = () => {
    try {
      player.pause();
    } catch {
      // no-op: player may already be disposed by native layer
    }
  };

  const safelyRestartAndPlay = () => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // no-op: player may already be disposed by native layer
    }
  };

  useEffect(() => {
    return () => {
      safelyPause();
    };
  }, [player]);

  useEffect(() => {
    if (!ttsSource || !playPending) {
      return;
    }

    safelyRestartAndPlay();
    setPlayPending(false);
  }, [playPending, player, ttsSource]);

  const handleListenPress = async () => {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    if (playerStatus.playing) {
      safelyPause();
      return;
    }

    if (ttsSource) {
      safelyRestartAndPlay();
      return;
    }

    setIsPreparingAudio(true);

    try {
      const source = await synthesizeSpeechWithElevenLabs(speakableResult);
      setTtsSource(source);
      setPlayPending(true);
    } finally {
      setIsPreparingAudio(false);
    }
  };

  return {
    isPreparingAudio,
    isPlaying: playerStatus.playing,
    handleListenPress,
  };
}

function extractSpeakableResult(rawResult: string): string {
  let value = rawResult.trim();

  if (value.startsWith('Here is your blend:')) {
    value = value.replace(/^Here is your blend:\s*/i, '').trim();
  }

  value =
    value.split(/\n\nRetold with the spirit of your second text:/i)[0]?.trim() || value;

  value =
    value
      .split(
        /\n\n(?:Missing EXPO_PUBLIC_CLAUDE_API_KEY\.|Claude returned empty response\.|Claude request failed\.)/i,
      )[0]
      ?.trim() || value;

  return value || rawResult.trim();
}
