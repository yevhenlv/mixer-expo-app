const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

type TtsOptions = {
  voiceId?: string;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0;
    const byte2 = bytes[index + 1] ?? 0;
    const byte3 = bytes[index + 2] ?? 0;

    const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    output += chars[(triplet >> 18) & 0x3f];
    output += chars[(triplet >> 12) & 0x3f];
    output += index + 1 < bytes.length ? chars[(triplet >> 6) & 0x3f] : '=';
    output += index + 2 < bytes.length ? chars[triplet & 0x3f] : '=';
  }

  return output;
}

export async function synthesizeSpeechWithElevenLabs(
  text: string,
  options?: TtsOptions,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_ELEVENLABS_API_KEY');
  }

  const voiceId =
    options?.voiceId?.trim() ||
    process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID?.trim() ||
    DEFAULT_VOICE_ID;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = arrayBufferToBase64(audioBuffer);

  return `data:audio/mpeg;base64,${base64Audio}`;
}
