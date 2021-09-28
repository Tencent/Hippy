import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
} from '@hippy/react';

import { useCallback, useRef } from 'react/cjs/react.development';
import imageUrl from './defaultSource.jpg';
import RippleViewAndroid from './RippleViewAndroid';

const styles = StyleSheet.create({
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  rectangle: {
    width: 360,
    height: 56,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRipple: {
    width: 80,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareRipple: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    position: 'absolute',
  },
});

export default function RippleViewExpo() {
  const rViewRef = useRef(null);
  const onTouchDown = useCallback((e) => {
    rViewRef.current.setPressed(true);
    rViewRef.current.setHotspot(e.page_x, e.page_y);
  });
  const onTouchEnd = useCallback(() => {
    rViewRef.current.setPressed(false);
  });
  if (Platform.OS === 'ios') {
    return <Text>ios暂未支持水波纹效果</Text>;
  }
  return (
    <ScrollView style={{ padding: 10 }}>
      <View style={[styles.rectangle, {
        marginTop: 20,
        backgroundImage: imageUrl,
        backgroundSize: 'cover',
      }]}
       >
        <View
          style={[styles.rectangle]}
          overflow={'visible'}
          nativeBackgroundAndroid={{ borderless: true, color: '#11000000' }}
          onTouchDown={onTouchDown}
          onTouchEnd={onTouchEnd}
          ref={rViewRef}
        >
          <Text style={{ color: 'white', maxWidth: 200 }}>外层背景图，内层无边框水波纹，受外层影响始终有边框</Text>
        </View>
      </View>
      <RippleViewAndroid
        style={[styles.circleRipple]}
        nativeBackgroundAndroid={{ borderless: true, color: '#11000000', rippleRadius: 100 }}
      >
        <Text style={{ color: 'black' }}>圆形水波纹</Text>
      </RippleViewAndroid>
      <View
        style={[{
          alignItems: 'center',
          justifyContent: 'center',
        }]}
      >
        <Image source={imageUrl} style={{ width: 150, height: 150 }} >
          <Text style={{ color: 'white' }}>有边框水波纹，带底图效果</Text>
        </Image>
        <RippleViewAndroid
          style={[styles.squareRipple]}
          nativeBackgroundAndroid={{ borderless: false, color: '#11000000' }}
        ></RippleViewAndroid>
      </View>
    </ScrollView>
  );
}
