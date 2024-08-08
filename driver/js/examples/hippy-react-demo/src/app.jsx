import React, { Component } from 'react';
import {
  ConsoleModule,
} from '@hippy/react';
import { View, Text } from '@hippy/react';

export default class App extends Component {
  componentDidMount() {
    ConsoleModule.log('~~~~~~~~~~~~~~~~~ This is a log from ConsoleModule ~~~~~~~~~~~~~~~~~');
  }

  render() {
    return (
      <View style={{ backgroundColor: '#f0f0f0f0', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: '#0f0f0f' }}>Hello World!</Text>
      </View>
    );
  }
}
