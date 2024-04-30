import React from 'react';
import {
  View,
  Text,
} from '@hippy/react';

export function TextColor() {
  return (<View>
    <Text style={[{ color: '#de4040', fontSize: 16 }]}>
      Text is with color #de4040
    </Text>
    <Text style={[{ color: 'rgba(243,0,0,0.45)', fontSize: 16 }]}>
      Text is with color rgba(243,0,0,0.45)
    </Text>
  </View>);
}

