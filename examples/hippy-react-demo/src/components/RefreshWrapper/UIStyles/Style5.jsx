import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
} from 'hippy-react';
import Utils from '../../../utils';

const IMAGE_WIDTH = Utils.getScreenWidth() - 2 * 12;
const IMAGE_HEIGHT = Math.floor(IMAGE_WIDTH * 188 / 336);

const styles = StyleSheet.create({
  text: {
    fontSize: Platform.OS === 'android' ? 17 : 18,
    lineHeight: 24,
    color: '#242424',
  },
  playerView: {
    marginTop: 8,
    alignItems: 'center',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignSelf: 'center',
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  normalText: {
    fontSize: 11,
    color: '#aaaaaa',
    alignSelf: 'center',
  },
  tagLine: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default function Style5(props) {
  if (props === 'undefined') return null;
  const { itemBean } = props;
  if (!itemBean) return null;

  const { title, picUrl } = itemBean;
  let { subInfo } = itemBean;
  let textViewItems = null;

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
    <View>
      <Text style={styles.text} numberOfLines={2} enableScale>
        {title}
      </Text>
      <View style={styles.playerView}>
        <Image style={styles.image} source={{ uri: picUrl }} resizeMode={Image.resizeMode.cover} />
      </View>
      {
        textViewItems ? (
          <View style={styles.tagLine}>
            {textViewItems}
          </View>
        ) : null
      }
    </View>
  );
}
