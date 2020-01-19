import React from 'react';
import { ScrollView, Text, StyleSheet } from '@hippy/react';
import Slider from './Slider';

const IMAGE_URLS = [
  'http://res.imtt.qq.com/circle/real/1528701933567-.jpg',
  'http://res.imtt.qq.com/circle/real/1527758982390-20180530184743.jpg',
  'http://res.imtt.qq.com/circle/real/1527670660574-.jpg',
];

const styles = StyleSheet.create({
  sliderStyle: {
    width: 400,
    height: 180,
  },
  infoStyle: {
    height: 40,
    fontSize: 16,
    color: '#4c9afa',
    marginTop: 15,
  },
});

export default function SliderExpo() {
  return (
    <ScrollView>
      <Text style={styles.infoStyle}>Auto:</Text>
      <Slider
        style={styles.sliderStyle}
        images={IMAGE_URLS}
        duration={1000}
      />
      <Text style={styles.infoStyle}>Manual:</Text>
      <Slider
        style={styles.sliderStyle}
        images={IMAGE_URLS}
        duration={0}
      />
    </ScrollView>
  );
}
