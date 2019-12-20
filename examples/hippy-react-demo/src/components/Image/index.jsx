import React from 'react';
import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
} from 'hippy-react';
// Import the image to base64 for defaultSource props.
/* eslint-disable-next-line import/no-webpack-loader-syntax */
import defaultSource from '!!url-loader?modules!./defaultSource.jpg';

const imageUrl = 'https://www.intelerad.com/en/wp-content/uploads/sites/2/2016/05/panorama_bg.jpg';

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
    borderRadius: 4,
  },
  info_style: {
    marginTop: 15,
    marginLeft: 16,
    fontSize: 16,
    color: '#4c9afa',
  },
});

export default function ImageExpo() {
  return (
    <ScrollView style={styles.container_style}>
      <Text style={styles.info_style}>Contain:</Text>
      <Image
        style={[styles.image_style, { resizeMode: 'contain' }]}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        onLoad={(e) => {
          /* eslint-disable-next-line no-console */
          console.log('onload e', e);
        }}
      />
      <Text style={styles.info_style}>Cover:</Text>
      <Image
        style={[styles.image_style, { resizeMode: 'cover' }]}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        onLoadStart={(e) => {
          /* eslint-disable-next-line no-console */
          console.log('onLoadStart e', e);
        }}
      />
      <Text style={styles.info_style}>Center:</Text>
      <Image
        style={[styles.image_style, { resizeMode: 'center' }]}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        onLoadEnd={(e) => {
          /* eslint-disable-next-line no-console */
          console.log('onLoadEnd e', e);
        }}
      />
      <Text style={styles.info_style}>Cover GIF:</Text>
      <Image
        style={[styles.image_style, { resizeMode: 'cover' }]}
        defaultSource={defaultSource}
        source={{ uri: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif' }}
        onLoadEnd={(e) => {
          /* eslint-disable-next-line no-console */
          console.log('onLoadEnd e', e);
        }}
      />
    </ScrollView>
  );
}
