import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';
import Utils from '../../../utils';

const IMAGE_CONTAINER_WIDTH = Utils.getScreenWidth() - 2 * 12;
const IMAGE_SPACE = 6;
const IMAGE_WIDTH = Math.floor(IMAGE_CONTAINER_WIDTH - IMAGE_SPACE * 2) / 3;
const IMAGE_ASPECT_RATIO = 108 * 1.0 / 80;
const IMAGE_HEIGHT = Math.floor(IMAGE_WIDTH / IMAGE_ASPECT_RATIO);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: IMAGE_HEIGHT,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 8,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  title: {
    fontSize: Platform.OS === 'android' ? 17 : 18,
    lineHeight: 24,
  },
  tagLine: {
    marginTop: 8,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  normalText: {
    fontSize: 11,
    color: '#aaaaaa',
    alignSelf: 'center',
  },

});
export default function Style2(props) {
  if (props === 'undefined') return null;
  const { itemBean } = props;
  if (!itemBean) return null;
  let textViewItems = null;
  const { title, picUrl } = itemBean;
  let { subInfo } = itemBean;
  if (subInfo && subInfo.length) {
    subInfo = Utils.uniqueArray(subInfo);
    const textArr = subInfo.join(' ');
    textViewItems = (
      <Text style={styles.normalText} numberOfLines={1}>
        {textArr}
      </Text>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.title} numberOfLines={2} enableScale>{title}</Text>
        {
          textViewItems ? (
            <View style={styles.tagLine}>
              {textViewItems}
            </View>
          ) : null
        }
      </View>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: picUrl }} />
      </View>
    </View>
  );
}
