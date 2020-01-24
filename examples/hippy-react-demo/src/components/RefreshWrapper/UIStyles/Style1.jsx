import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Platform,
} from '@hippy/react';
import Utils from '../../../utils';

const IMAGE_CONTAINER_WIDTH = Utils.getScreenWidth() - 2 * 12;
const IMAGE_SPACE = 6;
const IMAGE_WIDTH = (IMAGE_CONTAINER_WIDTH - IMAGE_SPACE * 2) / 3;
const IMAGE_ASPECT_RATIO = (108 * 1.0) / 80;
const IMAGE_HEIGHT = Math.floor(IMAGE_WIDTH / IMAGE_ASPECT_RATIO);

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    height: IMAGE_HEIGHT,
    marginTop: 8
  },
  normalText: {
    fontSize: 11,
    color: "#aaaaaa",
    alignSelf: "center"
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT
  },
  title: {
    fontSize: Platform.OS === "android" ? 17 : 18,
    lineHeight: 24,
    color: "#242424"
  },
  tagLine: {
    marginTop: 8,
    height: 20,
    flexDirection: "row",
    justifyContent: "flex-start"
  }
});

export default function Style1(props) {
  const {
    itemBean: { title, picList }
  } = props;
  let {
    itemBean: { subInfo }
  } = props;
  let textViewItems = null;
  if (subInfo && subInfo.length) {
    subInfo = Utils.uniqueArray(subInfo);
    const textArr = subInfo.join(" ");
    textViewItems = (
      <Text style={styles.normalText} numberOfLines={1}>
        {textArr}
      </Text>
    );
  }

  return (
    <View {...props}>
      <Text style={[styles.title]} numberOfLines={2} enableScale>
        {title}
      </Text>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: picList[0] }}
          resizeMode={Image.resizeMode.cover}
        />
        <Image
          style={[
            styles.image,
            {
              marginLeft: 6,
              marginRight: 6
            }
          ]}
          source={{ uri: picList[1] }}
          resizeMode={Image.resizeMode.cover}
        />
        <Image
          style={styles.image}
          source={{ uri: picList[2] }}
          resizeMode={Image.resizeMode.cover}
        />
      </View>
      {textViewItems ? <View style={styles.tagLine}>{textViewItems}</View> : null}
    </View>
  );
}
