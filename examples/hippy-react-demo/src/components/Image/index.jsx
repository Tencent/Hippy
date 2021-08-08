import React from 'react';
import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
} from '@hippy/react';

// Import the image to base64 for defaultSource props.
import imageUrl from './defaultSource.jpg';

const defaultSource = 'https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png';

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
        style={[styles.image_style]}
        resizeMode={Image.resizeMode.contain}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        onLoadStart={() => {
          /* eslint-disable-next-line no-console */
          console.log('===image onloadStart===');
        }}
        onLoad={() => {
          /* eslint-disable-next-line no-console */
          console.log('===image onLoad===');
        }}
        onError={(e) => {
          /* eslint-disable-next-line no-console */
          console.log('===image onError===', e);
        }}
        onLoadEnd={() => {
          /* eslint-disable-next-line no-console */
          console.log('===image onLoadEnd===');
        }}
      />
      <Text style={styles.info_style}>Cover:</Text>
      <Image
        style={[styles.image_style]}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        resizeMode={Image.resizeMode.cover}
      />
      <Text style={styles.info_style}>Center:</Text>
      <Image
        style={[styles.image_style]}
        defaultSource={defaultSource}
        source={{ uri: imageUrl }}
        resizeMode={Image.resizeMode.center}
      />
      <Text style={styles.info_style}>Cover GIF:</Text>
      <Image
        style={[styles.image_style]}
        resizeMode={Image.resizeMode.cover}
        defaultSource={defaultSource}
        source={{ uri: 'http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif' }}
        onLoadEnd={() => {
          /* eslint-disable-next-line no-console */
          console.log('gif onLoadEnd');
        }}
      />
    </ScrollView>
  );
}
