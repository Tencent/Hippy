import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Platform,
} from '@hippy/react';

/**
 * P.S. Android shadow size is based on the container size
 * and a solid shadow background exists.
 * You should make content fully cover the solid shadow background
 * whose size is determined by container size, shadowRadius and shadowOffset,
 * so Android container with shadow(170*170) should be bigger than content(160*160),
 * and set some offset(e.g. top or left) for content to cover shadow background.
 *
 * boxShadow consists attrs as follow：boxShadowOpacity，boxShadowRadius，boxShadowColor，
 * boxShadowOffsetX，boxShadowOffsetY，boxShadowSpread(iOS only).
 *
 * 注意: Android的阴影大小根据容器体积大小来决定，通过在容器上对矩形view做阴影来实现，阴影会有一个实体的背景色。
 * 因此必须用content内容去遮挡住阴影的实体背景，该背景由容器大小、阴影圆角和阴影偏移共同决定。
 * Android带有阴影的Container容器大小(170*170)必须大于Content内容的大小(160*160)，
 * 同时要将Content内容做一定的偏移（如top或者left）来遮盖阴影背景。
 *
 * boxShadow支持以下属性：boxShadowOpacity，boxShadowRadius，boxShadowColor，
 * boxShadowOffsetX，boxShadowOffsetY，boxShadowSpread(仅iOS).
 *
 * if you use borderRadius, Android container & content both should be set.
 * 如果设置了borderRadius，在Android上必须同时在Container容器和Content内容同时设置该属性。
 */
const stylesNoOffset = StyleSheet.create({
  shadowDemo: {
    flex: 1,
    overflowY: 'scroll',
  },
  // android boxShadow style
  shadowDemoCubeAndroid: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 170,
    height: 170,
    boxShadowOpacity: 0.6,
    boxShadowRadius: 5,
    boxShadowColor: '#4c9afa',
    // container & content should both set radius
    // 容器和内容都要设置radius
    borderRadius: 5,
  },
  shadowDemoContentAndroid: {
    position: 'absolute',
    // android set left & top offset to cover shadow solid background
    // android 设置left和top偏移来遮挡阴影实体背景
    left: 5,
    top: 5,
    width: 160,
    height: 160,
    backgroundColor: 'grey',
    borderRadius: 5,
    color: 'white',
    lineHeight: 160,
    textAlign: 'center',
  },
  // ios boxShadow style
  shadowDemoCubeIos: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 160,
    height: 160,
    boxShadowOpacity: 0.6,
    boxShadowRadius: 5,
    // spread attr is only supported on iOS
    // spread 属性仅适用于iOS
    boxShadowSpread: 1,
    boxShadowColor: '#4c9afa',
    borderRadius: 5,
  },
  shadowDemoContentIos: {
    width: 160,
    height: 160,
    backgroundColor: 'grey',
    borderRadius: 5,
    color: 'white',
    lineHeight: 160,
    textAlign: 'center',
  },
});

/**
 * P.S. Android shadow size is based on the container size
 * and a solid shadow background exists.
 * Shadow offset is not fully supported on Android.
 * if you have to use boxShadowOffset,
 * the tricky methods below is for reference on both Android and iOS
 *
 * 注意: Android 的阴影大小根据容器体积大小来决定，通过在容器上对矩形view做阴影来实现，阴影会有一个实体的背景色。
 * 在Android上shadow offset没有很好地支持。
 * 如果你必须要使用boxShadowOffset，可以通过以下的小技巧来调整适配。
 */
const stylesOffset = StyleSheet.create({
  // android boxShadow style
  shadowDemoCubeAndroid: {
    position: 'absolute',
    left: 50,
    top: 300,
    width: 175,
    height: 175,
    boxShadowOpacity: 0.6,
    boxShadowRadius: 5,
    boxShadowOffsetX: 15,
    boxShadowOffsetY: 15,
    boxShadowColor: '#4c9afa',
  },
  shadowDemoContentAndroid: {
    width: 160,
    height: 160,
    lineHeight: 160,
    textAlign: 'center',
    backgroundColor: 'grey',
    color: 'white',
  },
  // ios boxShadow style
  shadowDemoCubeIos: {
    position: 'absolute',
    left: 50,
    top: 300,
    width: 160,
    height: 160,
    boxShadowOpacity: 0.6,
    boxShadowRadius: 5,
    boxShadowOffsetX: 10,
    boxShadowOffsetY: 10,
    // spread attr is only supported on iOS
    // spread 属性仅适用于iOS
    boxShadowSpread: 1,
    boxShadowColor: '#4c9afa',
  },
  shadowDemoContentIos: {
    width: 160,
    height: 160,
    textAlign: 'center',
    backgroundColor: 'grey',
    color: 'white',
    lineHeight: 160,
  },
});

export default function BoxShadowExpo() {
  return (
    <View style={stylesNoOffset.shadowDemo}>
      {Platform.OS === 'android' ? (
        <View style={stylesNoOffset.shadowDemoCubeAndroid}>
          <Text style={stylesNoOffset.shadowDemoContentAndroid}>没有偏移阴影样式</Text>
        </View>
      ) : (
        <View style={stylesNoOffset.shadowDemoCubeIos}>
          <Text style={stylesNoOffset.shadowDemoContentIos}>没有偏移阴影样式</Text>
        </View>
      )}
      {Platform.OS === 'android' ? (
        <View style={stylesOffset.shadowDemoCubeAndroid}>
          <Text style={stylesOffset.shadowDemoContentAndroid}>偏移阴影样式</Text>
        </View>
      ) : (
        <View style={stylesOffset.shadowDemoCubeIos}>
          <Text style={stylesOffset.shadowDemoContentIos}>偏移阴影样式</Text>
        </View>
      )}
    </View>
  );
}
