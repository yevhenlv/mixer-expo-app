import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { EmitterSubscription, FlatList, Keyboard, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenShellProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  footerHeight?: number;
  scroll?: boolean;
  withKeyboard?: boolean;
  headerContentAnimatedStyle?: object;
}>;

const FOOTER_FADE_HEIGHT = 190;
const KEYBOARD_EXTRA_SCROLL_PADDING = 76;
const MAX_KEYBOARD_SCROLL_SPACE = 220;

export function ScreenShell({
  title,
  subtitle,
  children,
  footer,
  footerHeight = 96,
  scroll = false,
  withKeyboard = false,
  headerContentAnimatedStyle,
}: ScreenShellProps) {
  const keyboardFrameRef = useRef<EmitterSubscription | null>(null);
  const keyboardShowRef = useRef<EmitterSubscription | null>(null);
  const keyboardHideRef = useRef<EmitterSubscription | null>(null);
  const listRef = useRef<FlatList<number> | null>(null);
  const pendingAutoScrollRef = useRef(false);
  const [keyboardState, setKeyboardState] = useState(0);

  const insets = useSafeAreaInsets();
  const shouldScroll = scroll;
  const footerBottomOffset = (withKeyboard ? keyboardState : 0);
  const keyboardExtraPadding = withKeyboard && shouldScroll ? KEYBOARD_EXTRA_SCROLL_PADDING : 0;
  const contentBasePaddingBottom = footer
    ? footerHeight + keyboardExtraPadding
    : 0;
  const contentPadding = { paddingBottom: contentBasePaddingBottom + insets.bottom };
  const keyboardSpacerHeight =
    withKeyboard && shouldScroll && keyboardState > 0
      ? Math.min(keyboardState, MAX_KEYBOARD_SCROLL_SPACE)
      : 0;
  const animatedFooterBottom = useSharedValue(footerBottomOffset);
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.92);

  useEffect(() => {
    animatedFooterBottom.value = withSpring(footerBottomOffset, {
      damping: 17,
      stiffness: 165,
      mass: 0.8,
      overshootClamping: false,
    });
  }, [animatedFooterBottom, footerBottomOffset]);

  useEffect(() => {
    headerOpacity.value = 0;
    headerScale.value = 0.82;

    headerOpacity.value = withTiming(1, { duration: 320 });
    headerScale.value = withSpring(1, {
      damping: 14,
      stiffness: 180,
      mass: 0.75,
      overshootClamping: false,
    });
  }, [headerOpacity, headerScale]);

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    bottom: animatedFooterBottom.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  useEffect(() => {
    if (!withKeyboard) {
      return undefined;
    }

    const onKeyboardChange = (event?: {
      endCoordinates?: { height?: number; screenY?: number };
      startCoordinates?: { screenY?: number };
    }) => {
      const endCoordinates = event?.endCoordinates;
      const startCoordinates = event?.startCoordinates;
      const endY = endCoordinates?.screenY || 0;
      const startY = startCoordinates?.screenY || endY;
      const keyboardVisible = startY >= endY;
      setKeyboardState(keyboardVisible ? (endCoordinates?.height || 0) : 0);
    };

    const onKeyboardShow = (event?: { endCoordinates?: { height?: number } }) => {
      setKeyboardState(event?.endCoordinates?.height || 0);
    };

    const onKeyboardHide = () => {
      setKeyboardState(0);
    };

    keyboardFrameRef.current = Keyboard.addListener('keyboardWillChangeFrame', onKeyboardChange);
    keyboardShowRef.current = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    keyboardHideRef.current = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

    return () => {
      keyboardFrameRef.current?.remove();
      keyboardShowRef.current?.remove();
      keyboardHideRef.current?.remove();
    };
  }, [withKeyboard]);

  useEffect(() => {
    if (!withKeyboard || !shouldScroll || !listRef.current) {
      return;
    }

    pendingAutoScrollRef.current = keyboardState > 0;
  }, [keyboardState, shouldScroll, withKeyboard]);

  return (
    <LinearGradient colors={['#0A1020', '#121B35', '#0B142B']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Animated.View style={headerContentAnimatedStyle}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </Animated.View>
        </Animated.View>

        {shouldScroll ? (
          <FlatList
            ref={listRef}
            data={[0]}
            keyExtractor={() => 'keyboard-spacer'}
            renderItem={() => <View style={{ height: keyboardSpacerHeight }} />}
            style={styles.content}
            contentContainerStyle={[styles.scrollContent, contentPadding]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!withKeyboard || keyboardState <= 0 || !pendingAutoScrollRef.current) {
                return;
              }

              pendingAutoScrollRef.current = false;
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({ index: 0, viewPosition: 1, animated: true });
              });
            }}
            onScrollToIndexFailed={() => {
              requestAnimationFrame(() => {
                listRef.current?.scrollToEnd({ animated: true });
              });
            }}
            ListHeaderComponent={<>{children}</>}
          />
        ) : (
          <View style={[styles.content, contentPadding]}>{children}</View>
        )}

        {footer ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.footerFadeOverlay, footerAnimatedStyle]}
          >
            <LinearGradient
              colors={[
                'rgba(11, 20, 43, 0)',
                'rgba(11, 20, 43, 0.92)',
                'rgba(11, 20, 43, 1)',
                '#0B142B',
              ]}
              style={styles.footerFadeGradient}
            />
          </Animated.View>
        ) : null}

        {footer ? (
          <Animated.View style={[styles.footer, { height: footerHeight }, footerAnimatedStyle]}>
            {footer}
          </Animated.View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 8,
    gap: 8,
  },
  title: {
    color: '#EAF0FF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#AFC0ED',
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginTop: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  footerFadeOverlay: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: FOOTER_FADE_HEIGHT,
    zIndex: 9,
  },
  footerFadeGradient: {
    flex: 1,
  },
});
