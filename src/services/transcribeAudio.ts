const ELEVENLABS_STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

type ElevenLabsSttResponse = {
  text?: string;
};

function sanitizeTranscript(rawText: string): string {
  return rawText
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

function detectMimeType(uri: string): string {
  const normalized = uri.toLowerCase();

  if (normalized.endsWith('.m4a')) {
    return 'audio/mp4';
  }

  if (normalized.endsWith('.mp3')) {
    return 'audio/mpeg';
  }

  if (normalized.endsWith('.wav')) {
    return 'audio/wav';
  }

  if (normalized.endsWith('.webm')) {
    return 'audio/webm';
  }

  return 'audio/mp4';
}

export async function transcribeAudioWithElevenLabs(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_ELEVENLABS_API_KEY');
  }

  const mimeType = detectMimeType(uri);
  const extension = mimeType === 'audio/webm' ? 'webm' : 'm4a';

  const formData = new FormData();
  formData.append('model_id', 'scribe_v2');
  formData.append('tag_audio_events', 'false');
  formData.append('timestamps_granularity', 'none');
  formData.append('temperature', '0');
  formData.append('file', {
    uri,
    name: `recording.${extension}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(ELEVENLABS_STT_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs STT failed: ${response.status}`);
  }

  const data = (await response.json()) as ElevenLabsSttResponse;
  const text = sanitizeTranscript(data.text ?? '');

  if (!text) {
    throw new Error('Empty transcription result');
  }

  return text;
}
