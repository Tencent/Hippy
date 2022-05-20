import React from 'react';
import { ScrollView, Text, StyleSheet } from '@hippy/react';
import Slider from './Slider';

const IMAGE_URLS = [
  'https://user-images.githubusercontent.com/12878546/148736627-bca54707-6939-45b3-84f7-74e6c2c09c88.jpg',
  'https://user-images.githubusercontent.com/12878546/148736679-0521fdff-09f5-40e3-a36a-55c8f714be16.jpg',
  'https://user-images.githubusercontent.com/12878546/148736685-a4c226ad-f64a-4fe0-b3df-ce0d8fcd7a01.jpg',
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
