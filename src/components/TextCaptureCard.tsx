import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { transcribeAudioWithElevenLabs } from '../services/transcribeAudio';

type TextCaptureCardProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onRecordingStateChange?: (isRecording: boolean) => void;
};

const MAX_RECORDING_SECONDS = 10;
const MAX_RECORDING_MS = MAX_RECORDING_SECONDS * 1000;

export function TextCaptureCard({
  value,
  onChange,
  placeholder,
  onRecordingStateChange,
}: TextCaptureCardProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const valueRef = useRef(value);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onRecordingStateChange?.(recorderState.isRecording);
  }, [onRecordingStateChange, recorderState.isRecording]);

  const handleStartRecording = async () => {
    setVoiceError(null);

    const permissions = await requestRecordingPermissionsAsync();
    if (!permissions.granted) {
      setVoiceError('Microphone permission denied.');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const handleStopRecording = async () => {
    if (isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;
    setVoiceError(null);

    await audioRecorder.stop();

    const uri = audioRecorder.uri;
    if (!uri) {
      setVoiceError('Recording failed. Try again.');
      return;
    }

    setIsTranscribing(true);

    try {
      const transcript = await transcribeAudioWithElevenLabs(uri);
      const nextValue = valueRef.current.trim().length
        ? `${valueRef.current.trim()}\n${transcript}`
        : transcript;

      onChange(nextValue);
    } catch {
      setVoiceError('Transcription failed. Check ElevenLabs API key.');
    } finally {
      setIsTranscribing(false);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      isStoppingRef.current = false;
    }
  };

  const handleVoicePress = async () => {
    if (isTranscribing) {
      return;
    }

    if (recorderState.isRecording) {
      await handleStopRecording();
      return;
    }

    await handleStartRecording();
  };

  const recordingDurationMs = recorderState.durationMillis ?? 0;
  const remainingSeconds = Math.max(
    0,
    MAX_RECORDING_SECONDS - Math.floor(recordingDurationMs / 1000),
  );

  useEffect(() => {
    if (!recorderState.isRecording || isTranscribing || isStoppingRef.current) {
      return;
    }

    if (recordingDurationMs < MAX_RECORDING_MS) {
      return;
    }

    void handleStopRecording();
  }, [isTranscribing, recorderState.isRecording, recordingDurationMs]);

  return (
    <View style={styles.card}>
      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7E91C7"
        style={styles.input}
        textAlignVertical="top"
      />

      <View style={styles.footerRow}>
        <Pressable
          onPress={handleVoicePress}
          disabled={isTranscribing}
          style={({ pressed }) => [
            styles.voiceButton,
            recorderState.isRecording && styles.voiceButtonRecording,
            pressed && styles.voiceButtonPressed,
            isTranscribing && styles.voiceButtonDisabled,
          ]}
        >
          <Text style={styles.voiceButtonText}>
            {recorderState.isRecording ? '■ Stop' : '🎤 Voice'}
          </Text>
        </Pressable>

        <Text style={styles.voiceStatus}>
          {isTranscribing
            ? 'Transcribing...'
            : recorderState.isRecording
              ? `Recording... ${remainingSeconds}s`
              : voiceError || ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#31416D',
    borderRadius: 20,
    backgroundColor: 'rgba(11, 19, 40, 0.85)',
    minHeight: 110,
    padding: 16,
  },
  input: {
    color: '#F0F4FF',
    fontSize: 17,
    lineHeight: 24,
    minHeight: 100,
  },
  footerRow: {
    marginTop: 10,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceButton: {
    borderWidth: 1,
    borderColor: '#4A5D96',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  voiceButtonRecording: {
    borderColor: '#73D9A2',
  },
  voiceButtonPressed: {
    opacity: 0.85,
  },
  voiceButtonDisabled: {
    opacity: 0.6,
  },
  voiceButtonText: {
    color: '#CFE0FF',
    fontSize: 12,
    fontWeight: '700',
  },
  voiceStatus: {
    flex: 1,
    color: '#AFC0ED',
    fontSize: 12,
  },
});
