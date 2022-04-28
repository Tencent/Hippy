# 自定义组件和模块

# 自定义组件

写个 React 组件，在需要渲染的地方通过 `nativeName` 指定到终端组件名称即可，以终端范例中的 `MyView` 为例：

```javascript
import  React from "react";
import { UIManagerModule } from "@hippy/react"

export class MyView extends React.Component {
  constructor(props) {
      super(props);
      this.state = {};
      this.changeColor = this.changeColor.bind(this);
  }

  changeColor(color) {
    // callUIFunction 只能接收一个实际渲染的终端节点
    UIManagerModule.callUIFunction(this.instance, "changeColor", [color]);
  }

  render() {
    return (
      <div
        ref={ref => this.instance = ref}  // 设置 ref 方便 changeColor 获取
        nativeName="MyView"               // **必须：**将前端组件与终端组件进行绑定
        {...this.props}
      ></div>
    )
  }
}
```

# 自定义模块

> 该范例仅可以在 Android 下运行。

前端扩展模块分为三步：

1. 第一步导入 callNative 或者 callNativeWithPromise 接口
2. 封装调用接口
3. 导出模块

```javascript
// TestModule.js
import { callNative, callNativeWithPromise } from "@hippy/react"

/*
 自定义module
 */
const TestModule = {
  log(msg) {
    callNative("TestModule", "log", msg)
  },
  helloNative(msg) {
    callNative("TestModule", "helloNative", msg)
  },
  //这个是需要终端回调的
  helloNativeWithPromise(msg) {
    return callNativeWithPromise("TestModule", "helloNativeWithPromise", msg);
  }
}

export { TestModule }
```

## 使用

```jsx
import React from "react";
import { Text } from "@hippy/react"
import { TestModule } from "./TestModule"

//展示自定义Module的使用
export default class TestModuleDemo extends React.Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { hello: "TestModule log" }
    //调用
    TestModule.log("hello I am from js");
    TestModule.helloNative({ hello: "I am from js" })
    TestModule.helloNativeWithPromise({ hello: "I am from js" })
      .then(rsp => this.setState({ hello: JSON.stringify(rsp) }));
  }

  render() {
    const { hello } = this.state;
    return (
      <Text style={{ color: "red" }}>
        {hello}
      </Text>
    )
  }
}
```
