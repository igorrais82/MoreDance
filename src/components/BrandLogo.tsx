import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 220, style, imageStyle }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={require('../../assets/logo.jpg')}
        style={[styles.image, { width: size, height: size }, imageStyle]}
        resizeMode="cover"
        accessibilityLabel="Море танцев — MoreDance"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    borderRadius: 999,
  },
});
