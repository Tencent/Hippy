import React from 'react';
import {
  Text,
} from '@hippy/react';

export function TextStyle() {
  return (<Text style={[{ color: '#242424', fontSize: 16, fontStyle: 'italic' }]}>
    Text is grey with radius 3 and offset 1</Text>);
}

