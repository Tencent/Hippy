import React from 'react';
import {
  View,
  StyleSheet,
} from '@hippy/react';

const styleObj = StyleSheet.create({
  asyncComponentDemo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
    width: 300,
    backgroundColor: '#5dabfb',
    borderRadius: 10,
    marginBottom: 10,
  },
});

const AsyncComponentFromLocal = () => (
  <View style={styleObj.asyncComponentDemo}>
    我是本地异步组件
  </View>
);

export default AsyncComponentFromLocal;
