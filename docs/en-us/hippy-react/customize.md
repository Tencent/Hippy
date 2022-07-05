# Custom Component And Module

# Custom Components

Define a custom React component by specifying the name of the native component by `nativeName` where it needs to be rendered. Take `MyView` in the native example as an example:

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
    // callUIFunction can only receive one actually rendered endpoint
    UIManagerModule.callUIFunction(this.instance, "changeColor", [color]);
  }

  render() {
    return (
      <div
        ref={ref => this.instance = ref}  // Set ref for easy changeColor acquisition
        nativeName="MyView"               // **Required**: Bind the front-end component to the native component
        {...this.props}
      ></div>
    )
  }
}
```

# Custom Modules

> This example only works on Android.

Front-end expansion modules are divided into three steps:

1. Import callNative or callNativeWithPromise interface
2. Encapsulate the calling interface
3. Export module

```javascript
// TestModule.js
import { callNative, callNativeWithPromise } from "@hippy/react"

/*
 Custom module
 */
const TestModule = {
  log(msg) {
    callNative("TestModule", "log", msg)
  },
  helloNative(msg) {
    callNative("TestModule", "helloNative", msg)
  },
  // Requires native callback
  helloNativeWithPromise(msg) {
    return callNativeWithPromise("TestModule", "helloNativeWithPromise", msg);
  }
}

export { TestModule }
```

## Use

```jsx
import React from "react";
import { Text } from "@hippy/react"
import { TestModule } from "./TestModule"

// Example of the use of custom Module
export default class TestModuleDemo extends React.Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { hello: "TestModule log" }
    // calling module
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
