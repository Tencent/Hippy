import React from 'react';
import {
  View,
  StyleSheet,
} from '@hippy/react';

const styles = StyleSheet.create({
  rectangle: {
    width: 160,
    height: 80,
    marginVertical: 10,
  },
});

export function ViewBorder() {
  return (
    <View>
      <View style={[styles.rectangle, { borderColor: '#242424', borderRadius: 4, borderWidth: 1, borderStyle: 'solid' }]} />
    </View>
  );
}
