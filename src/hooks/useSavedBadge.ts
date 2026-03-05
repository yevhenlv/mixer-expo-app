import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function useSavedBadge(text: string, isAudioRecording: boolean) {
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasText = useMemo(() => text.trim().length > 0, [text]);
  const feedbackProgress = useSharedValue(0);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!hasText) {
      setShowSavedBadge(false);
      return;
    }

    setShowSavedBadge(false);
    typingTimeoutRef.current = setTimeout(() => {
      setShowSavedBadge(true);
    }, 450);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [hasText, text]);

  useEffect(() => {
    feedbackProgress.value = withTiming(showSavedBadge && !isAudioRecording ? 1 : 0, {
      duration: 220,
    });
  }, [feedbackProgress, isAudioRecording, showSavedBadge]);

  const savedBadgeStyle = useAnimatedStyle(() => ({
    opacity: feedbackProgress.value,
    transform: [{ scale: 0.88 + feedbackProgress.value * 0.12 }],
  }));

  return { savedBadgeStyle };
}
