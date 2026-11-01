import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Прозрачная обёртка экрана. Сам градиент теперь живёт в `RootBackdrop`
 * одним слоем: так при переключении вкладок не бывает кадра с тёмным фоном,
 * а цвета перетекают плавно.
 */
export function StageBackground({ children, style }: Props) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
