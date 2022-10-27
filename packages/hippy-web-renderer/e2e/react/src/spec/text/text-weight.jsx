import React from 'react';
import {
  View,
  Text,
} from '@hippy/react';

export default function TextWeightCase() {
  return (<View>
    <Text style={[{ color: '#242424', fontSize: 16,fontWeight: 700 }]}>
      Text is with weight 700
    </Text>
    <Text style={[{ color: '#242424', fontSize: 16,fontWeight: 400 }]}>
      Text is with weight 400
    </Text>
  </View>);
}

