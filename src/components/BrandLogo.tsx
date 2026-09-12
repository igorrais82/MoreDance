import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 220, style, imageStyle }: Props) {
  return (
    <View
      style={[
        styles.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, imageStyle]}
          resizeMode="cover"
          accessibilityLabel="Море танцев — MoreDance"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    alignSelf: 'center',
    shadowColor: '#00F5FF',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#14082A',
  },
  image: {},
});
