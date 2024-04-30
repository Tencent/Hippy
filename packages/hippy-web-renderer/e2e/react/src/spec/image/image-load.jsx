import React, { useEffect } from 'react';
import { Image, ImageLoaderModule, StyleSheet, View } from '@hippy/react';

const styles = StyleSheet.create({
  container_style: {
    alignItems: 'center',
  },
  image_style: {
    width: 300,
    height: 180,
    margin: 16,
    borderColor: '#4c9afa',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  info_style: {
    marginTop: 15,
    marginLeft: 16,
    fontSize: 16,
    color: '#4c9afa',
  },
});
const imageUrl = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';
export function ImageLoad() {
  useEffect(() => {
    globalThis.currentRef = {
      getSize: async () => await ImageLoaderModule.getSize(imageUrl),
    };
  });
  return (
    <View>
      <Image
        style={[styles.image_style]}
        resizeMode={Image.resizeMode.contain}
        source={{ uri: imageUrl }}
        onProgress={(e) => {
          console.log('onProgress', e);
        }}
        onLoadStart={() => {
          console.log('image onloadStart');
        }}
        onLoad={() => {
          console.log('image onLoad');
        }}
        onError={(e) => {
          console.log('image onError', e);
        }}
        onLoadEnd={() => {
          console.log('image onLoadEnd');
        }}
      />
    </View>
  );
}
