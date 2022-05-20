import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Platform,
} from '@hippy/react';

import imageUrl from './defaultSource.jpg';
import RippleViewAndroid from './RippleViewAndroid';
const httpImageUrl = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';

const styles = StyleSheet.create({
  imgRectangle: {
    width: 260,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRipple: {
    marginTop: 30,
    width: 150,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4c9afa',
  },
  squareRipple: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    backgroundColor: '#4c9afa',
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  squareRippleWrapper: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 150,
    marginTop: 30,
  },
  squareRipple1: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    borderWidth: 5,
    backgroundSize: 'cover',
    borderColor: '#4c9afa',
    backgroundImage: imageUrl,
    paddingHorizontal: 10,
  },
  squareRipple2: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    paddingHorizontal: 10,
    backgroundSize: 'cover',
    backgroundImage: httpImageUrl,
  },
});

export default function RippleViewExpo() {
  if (Platform.OS === 'ios') {
    return <Text>iOS暂未支持水波纹效果</Text>;
  }
  return (
    <ScrollView style={{ margin: 10, flex: 1 }}>
      <View style={[styles.imgRectangle, {
        marginTop: 20,
        backgroundImage: imageUrl,
        backgroundSize: 'cover',
      }]}
       >
        <RippleViewAndroid
          style={[styles.imgRectangle]}
          nativeBackgroundAndroid={{ borderless: true, color: '#666666' }}
        >
          <Text style={{ color: 'white', maxWidth: 200 }}>外层背景图，内层无边框水波纹，受外层影响始终有边框</Text>
        </RippleViewAndroid>
      </View>
      <RippleViewAndroid
        style={[styles.circleRipple]}
        nativeBackgroundAndroid={{ borderless: true, color: '#666666', rippleRadius: 100 }}
      >
        <Text style={{ color: 'black', textAlign: 'center' }}>无边框圆形水波纹</Text>
      </RippleViewAndroid>
      <RippleViewAndroid
        style={[styles.squareRipple]}
        nativeBackgroundAndroid={{ borderless: false, color: '#666666' }}
      >
        <Text style={{ color: '#fff' }}>带背景色水波纹</Text>
      </RippleViewAndroid>
      <View
        style={[styles.squareRippleWrapper]}
      >
        <RippleViewAndroid
          style={[styles.squareRipple1]}
          nativeBackgroundAndroid={{ borderless: false, color: '#666666' }}
        >
          <Text style={{ color: 'white' }}>有边框水波纹，带本地底图效果</Text>
        </RippleViewAndroid>
      </View>
      <View
        style={[styles.squareRippleWrapper]}
      >
        <RippleViewAndroid
          style={[styles.squareRipple2]}
          nativeBackgroundAndroid={{ borderless: false, color: '#666666' }}
        >
          <Text style={{ color: 'black' }}>有边框水波纹，带网络底图效果</Text>
        </RippleViewAndroid>
      </View>
    </ScrollView>
  );
}
