import { ImageSourcePropType } from 'react-native';

/** Neon thumbnails for each program dance. */
export const danceImages: Record<string, ImageSourcePropType> = {
  waltz: require('../../assets/dances/waltz.png'),
  'cha-cha': require('../../assets/dances/cha-cha.png'),
  jive: require('../../assets/dances/jive.png'),
  quickstep: require('../../assets/dances/quickstep-v2.png'),
  samba: require('../../assets/dances/samba.png'),
};

export function getDanceImage(danceId: string): ImageSourcePropType | undefined {
  return danceImages[danceId];
}
