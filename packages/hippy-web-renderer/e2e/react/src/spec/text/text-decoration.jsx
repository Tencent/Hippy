import React from 'react';
import {
  Text,
} from '@hippy/react';

export default function TextDecorationCase() {
  return (<Text>
    <Text numberOfLines={1} style={[{ fontSize: 16 }, { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }]}>
      underline
    </Text>
    <Text numberOfLines={1} style={[{ fontSize: 16 }, { textDecorationLine: 'line-through', textDecorationColor: 'red' }]}>
      line-through
    </Text>
  </Text>);
}

