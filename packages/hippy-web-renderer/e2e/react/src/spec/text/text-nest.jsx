import React from 'react';
import {
  Text,
} from '@hippy/react';

export function TextNest() {
  return (
    <Text numberOfLines={3}>
      <Text numberOfLines={3} style={[{ color: '#4c9afa' }]}>#SpiderMan#</Text>
      <Text numberOfLines={3}>
        Hello world, I am a spider man and I have five friends in other universe.
      </Text>
  </Text>);
}

