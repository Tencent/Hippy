import React, { useCallback, useRef } from 'react';
import {
  View,
} from '@hippy/react';

const defaultRippleConfig = {
  borderless: false,
};
export default function RippleViewAndroid(props) {
  const rViewRef = useRef(null);
  const onTouchDown = useCallback((e) => {
    rViewRef.current.setPressed(true);
    props.onTouchDown && props.onTouchDown(e);
    if (props.needHotspot) {
      rViewRef.current.setHotspot(e.page_x, e.page_y);
    }
  });
  const onTouchEnd = useCallback((e) => {
    rViewRef.current.setPressed(false);
    props.onTouchEnd && props.onTouchEnd(e);
  });
  const { nativeBackgroundAndroid, style } = props;
  return (
    <View
      style={style}
      nativeBackgroundAndroid={{ ...defaultRippleConfig, ...nativeBackgroundAndroid }}
      onTouchDown={onTouchDown}
      onTouchEnd={onTouchEnd}
      ref={rViewRef}
      onClick={() => {
        console.log('onClick......');
      }}
    >
      {props.children}
    </View>
  );
}
