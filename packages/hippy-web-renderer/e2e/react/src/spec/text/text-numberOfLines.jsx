import React from 'react';
import {
  View,
  Text,
} from '@hippy/react';

export function NumberOfLines() {
  const content = 'Text is with color #de4040,Text is with color #de4040,Text is with color #de4040, Text is with color #de4040,Text is with color #de4040';
  return (<View style={{ width: 200 }}>
    <Text style={[{ color: '#de4040', fontSize: 16 }]}  numberOfLines={2}>
      {content}
    </Text>
  </View>);
}

