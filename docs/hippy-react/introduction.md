# hippy-react 介绍

hippy-react 是基于 Facebook React 的官方自定义渲染器 [react-reconciler](//www.npmjs.com/package/react-reconciler) 重新开发的 React 到终端的渲染层，可以使用 React 的全部特性。

在语法上 hippy-react 更加接近底层终端，使用了类似 [React Native](//facebook.github.io/react-native/) 的语法。

# 架构图

<img src="assets/img/hippy-react.png" alt="hippy-react 架构图" width="70%"/>
<br />
<br />

# 初始化

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
    // 终端给前端的初始化参数，终端可以将一些启动需要的自定义属性放到入口文件props里
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
