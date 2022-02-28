import React, { useRef, useState } from 'react';
import {
  UIManagerModule,
  View,
} from '@hippy/react';

const defaultRippleConfig = {
  borderless: false,
};
export default function RippleViewAndroid(props) {
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const rViewRef = useRef(null);
  const onTouchDown = (e) => {
    rViewRef.current.setHotspot(e.page_x - viewX, e.page_y - viewY);
    rViewRef.current.setPressed(true);
  };
  const onTouchEnd = () => {
    rViewRef.current.setPressed(false);
  };
  const { nativeBackgroundAndroid, style } = props;
  return (
    <View
      onLayout={() => {
        UIManagerModule.measureInAppWindow(rViewRef.current, (e) => {
          setViewX(e.x);
          setViewY(e.y);
        });
      }}
      style={style}
      onTouchDown={onTouchDown}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      ref={rViewRef}
      nativeBackgroundAndroid={{ ...defaultRippleConfig, ...nativeBackgroundAndroid }}
    >
      {props.children}
    </View>
  );
}
