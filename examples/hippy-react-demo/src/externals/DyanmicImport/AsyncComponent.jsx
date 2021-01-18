import React from 'react';
import {
  View,
  StyleSheet,
} from '@hippy/react';

const styleObj = StyleSheet.create({
  asyncComponentDemo: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: 300,
    width: 400,
    backgroundColor: '#0055f0',
  },
});

const AsyncComponent = () => (
  <View style={styleObj.asyncComponentDemo}>
    我是异步组件
  </View>
);

export default AsyncComponent;
