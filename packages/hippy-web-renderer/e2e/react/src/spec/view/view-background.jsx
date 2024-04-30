import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from '@hippy/react';

const styles = StyleSheet.create({
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  rectangle: {
    width: 160,
    height: 80,
    marginVertical: 10,
  },
  bigRectangle: {
    width: 200,
    height: 100,
    borderColor: '#eee',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 10,
    marginVertical: 10,
  },
  smallRectangle: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
});
const imageUrl = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';

export function ViewBackground() {
  return (
    <View>
      <View style={[styles.rectangle, { backgroundColor: '#4c9afa' }]} />
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundImage: imageUrl,
      }]}
            accessible={true}
            accessibilityLabel={'背景图'}
            accessibilityRole={'image'}
            accessibilityState={{
              disabled: false,
              selected: true,
              checked: false,
              expanded: false,
              busy: true,
            }}
            accessibilityValue={{
              min: 1,
              max: 10,
              now: 5,
              text: 'middle',
            }}
      ><Text style={{ color: 'white' }}>背景图</Text></View>
      <View style={[styles.rectangle, {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'black',
        borderRadius: 2,
        backgroundImage: 'linear-gradient(30deg, blue 10%, yellow 40%, red 50%);',
      }]} ><Text style={{ color: 'white' }}>渐变色</Text></View>
    </View>
  );
}
