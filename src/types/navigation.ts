import { MixMode } from './mixMode';

export type RootStackParamList = {
  Text1: undefined;
  Text2: { text1: string };
  Mixing: { text1: string; text2: string; mode: MixMode };
  Result: { text1: string; text2: string; result: string };
};
