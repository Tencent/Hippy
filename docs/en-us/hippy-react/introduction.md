# Introduction To Hippy-react

hippy-react is a React-to-native rendering layer redeveloped based on Facebook React's official custom renderer [react-reconciler](//www.npmjs.com/package/react-reconciler), which can use all of React's features.

In terms of syntax, hippy-react is closer to the underlying native, using a syntax similar to [React Native](//facebook.github.io/react-native/).

# Architecture Diagram

<img src="assets/img/hippy-react.png" alt="hippy-react 架构图" width="70%"/>
<br />
<br />

# Initialization

```javascript
import { Hippy, View } from '@hippy/react';
import React, { Component } from 'react';

new Hippy({
  appName: 'Demo',
  entryPage: App,
  // set global bubbles, default is false
  bubbles: false,
  // set log output, default is false
  silent: false,
}).start();

class App extends Component {
  constructor(props) {
    // Initialization parameters from native to front end.The native can put some custom properties required for startup into the entry file props
    super(props);
  }

  render() {
    const { __instanceId__: instanceId } = this.props;
    console.log('instanceId', instanceId);
    return (
      <View></View>
    );
  }
}

```
