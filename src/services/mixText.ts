import { MixMode } from '../types/mixMode';

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

const CLAUDE_MODEL_CANDIDATES = [
  process.env.EXPO_PUBLIC_CLAUDE_MODEL?.trim(),
  'claude-sonnet-4-6',
  'claude-haiku-4-5',
  'claude-haiku-4-5-20251001',
  'claude-opus-4-6',
].filter((model): model is string => Boolean(model));

type ClaudeResponse = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

export async function mixTextWithAI(
  text1: string,
  text2: string,
  mode: MixMode = 'style-transfer',
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY?.trim();

  if (!apiKey) {
    return buildFallbackMix(text1, text2, 'missing-key');
  }

  try {
    let lastError: Error | null = null;
    let seenModelNotFound = false;

    for (const model of CLAUDE_MODEL_CANDIDATES) {
      try {
        const mixed = await requestClaudeMix({ apiKey, model, text1, text2, mode });
        return mixed || buildFallbackMix(text1, text2, 'empty-response');
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        lastError = error instanceof Error ? error : new Error(detail);

        if (!isModelNotFoundError(detail)) {
          throw lastError;
        }

        seenModelNotFound = true;
      }
    }

    if (seenModelNotFound) {
      throw new Error(
        `Claude request failed: no available model for this account. Set EXPO_PUBLIC_CLAUDE_MODEL in .env to a model ID from your Anthropic dashboard. Tried: ${CLAUDE_MODEL_CANDIDATES.join(', ')}`,
      );
    }

    throw lastError ?? new Error('Claude request failed: no available model');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown request failure';
    return buildFallbackMix(text1, text2, 'request-failed', detail);
  }
}

async function requestClaudeMix({
  apiKey,
  model,
  text1,
  text2,
  mode,
}: {
  apiKey: string;
  model: string;
  text1: string;
  text2: string;
  mode: MixMode;
}): Promise<string> {
  const instruction = buildModeInstruction(mode);

  const response = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0.85,
      system:
        'You blend two user texts. Return only the final blended text without explanations, labels, or metadata.',
      messages: [
        {
          role: 'user',
          content: `${instruction}\n\nText 1:\n${text1}\n\nText 2:\n${text2}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let apiMessage = '';

    try {
      const parsed = JSON.parse(errorText) as {
        error?: { message?: string };
        message?: string;
      };
      apiMessage = parsed.error?.message?.trim() || parsed.message?.trim() || '';
    } catch {
      apiMessage = errorText.slice(0, 160).trim();
    }

    throw new Error(
      `Claude error ${response.status}${apiMessage ? `: ${apiMessage}` : ''} (model: ${model})`,
    );
  }

  const data = (await response.json()) as ClaudeResponse;
  return (
    data.content
      ?.filter((item) => item.type === 'text' && item.text)
      .map((item) => item.text?.trim() || '')
      .join('\n')
      .trim() ?? ''
  );
}

function buildModeInstruction(mode: MixMode): string {
  if (mode === 'mashup') {
    return 'Creatively combine Text 1 and Text 2 into one coherent piece that keeps key ideas from both.';
  }

  if (mode === 'debate') {
    return 'Turn Text 1 and Text 2 into a short dialogue between two perspectives with clear back-and-forth lines.';
  }

  if (mode === 'poetry') {
    return 'Blend Text 1 and Text 2 into a short poem with vivid imagery and emotional tone.';
  }

  return 'Rewrite Text 1 in the style, tone, and rhythm of Text 2 while preserving Text 1 meaning.';
}

function isModelNotFoundError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('model') && normalized.includes('not found');
}

function buildFallbackMix(
  text1: string,
  text2: string,
  reason: 'missing-key' | 'request-failed' | 'empty-response',
  detail?: string,
): string {
  const normalized1 = text1.trim();
  const normalized2 = text2.trim();
  const anchorWords = normalized2
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 4)
    .slice(0, 6)
    .join(', ');

  const reasonHint =
    reason === 'missing-key'
      ? 'Missing EXPO_PUBLIC_CLAUDE_API_KEY.'
      : reason === 'empty-response'
        ? 'Claude returned empty response.'
        : `Claude request failed.${detail ? ` ${detail}` : ' Check API key, network, or API limits.'}`;

  return `Here is your blend:\n\n${normalized1}\n\nRetold with the spirit of your second text: ${anchorWords || normalized2}.\n\n${reasonHint}`;
}
