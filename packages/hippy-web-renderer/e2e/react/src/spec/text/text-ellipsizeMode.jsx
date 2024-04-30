import React from 'react';
import {
  View,
  Text,
} from '@hippy/react';

export function TextEllipsizeMode() {
  return (<View style={{ width: 150 }}>
    <View  style={{ height: 20 }}>
      <Text style={[{ color: '#de4040', fontSize: 16 }]} ellipsizeMode={'ellipsis'}>
        Text is very long, use style with ellipsis, need show diff
      </Text>
    </View>
    <View  style={{ height: 20 }}>
      <Text style={[{ color: '#de4040', fontSize: 16 }]} ellipsizeMode={'clip'}>
        Text is very long, use style with clip, need show diff clip
      </Text>
    </View>
  </View>);
}

