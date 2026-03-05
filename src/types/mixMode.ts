export type MixMode = 'style-transfer' | 'mashup' | 'debate' | 'poetry';

export const MIX_MODE_OPTIONS: Array<{
  value: MixMode;
  label: string;
}> = [
  {
    value: 'style-transfer',
    label: 'Style Transfer',
  },
  {
    value: 'mashup',
    label: 'Mashup',
  },
  {
    value: 'debate',
    label: 'Debate',
  },
  {
    value: 'poetry',
    label: 'Poetry',
  },
];
