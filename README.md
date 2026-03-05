# Text Mixer App (Expo)

Mini React Native app

## What it does

- Screen 1: capture `Text 1`
- Screen 2: capture `Text 2` and keep compact preview of `Text 1`
- Screen 3: animated mixing state (Reanimated) + haptics
- Screen 4: reveal mixed result with typewriter-like entrance

Default mix mode is **Style Transfer**: rewrite Text 1 in the style/tone of Text 2.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add API keys (optional but recommended) in `.env`:

```bash
EXPO_PUBLIC_CLAUDE_API_KEY=your_claude_key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
```

3. Run the app:

```bash
npm run ios
# or
npm run android
# or
npm run web
```

## Tech choices

- Expo (managed workflow)
- React Navigation (stack, no tabs)
- Reanimated for mixing motion and screen moments
- Expo Haptics for tactile feedback
- Claude API (Anthropic Messages) via `fetch`
