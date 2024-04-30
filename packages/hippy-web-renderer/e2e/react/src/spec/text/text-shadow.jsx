import React from 'react';
import {
  Text,
} from '@hippy/react';

export function TextShadow() {
  return (<Text style={[{ color: '#242424', fontSize: 16,
    textShadowColor: 'grey',
    textShadowRadius: 3,
    textShadowOffset: {
      x: 1,
      y: 1,
    } }]}>
    Text is shadow with color grey offset 1 radius 3</Text>);
}

