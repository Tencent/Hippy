# Hippy React

> Write Hippy cross platform app with React.

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## Introduction

`hippy-react` is the React binding for Hippy, the syntax just like React Native, but advantaged.

* All of components support touch events.
* Recyclable `ListView` is built-in.
* Animation is depolyed at once.

## How to use

### Installation

Create a empty react project with [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html),
then enter into the project and install `hippy-react` with npm:

    npm install @hippy/react

## Advanced topics

### Custom component

Confirmed the new component name and methods with Native develop, then write  new component:

```javascript
import React from 'react';
import { callUIFunction } from '@hippy/react';

class CustomComponent extends React.Component {
  /**
   * Method for custom component.
   * Replace `[METHOD_NAME]` to real method name.
   */
  [METHOD_NAME](...args) {
    /**
     * Call the native UI Function
     * 
     * @param {ReactRef} instance - React Ref, use for get the component Id
     * @param {string} methodName - Native method name.
     * @param {any[]} args - Arguments of native method, **MUST BE IN ARRAY**
     */
    callUIFunction(this.instance, [METHOD_NAME], args);
  }

  render() {
    return (
      {
        /*
         * Custom component must define the `nativeName` props,
         * that mapping to native component name.
         */
      }
      <div nativeName="[NATIVE_COMPONENT_NAME]" ref={ref => this.instance = ref} />
    );
  }
}

```

### Custom module

There are two implementation of modules

For the C++ module, the methods are injected into JS enviroment, just call the method.

For the modules implemented by Objective C or Java, use the `callNative` for execution.

```javascript
const { callNative, callNativeWithPromise } from '@hippy/react';

const SomeModule = {
  /**
   * Method that not need repsonse
   */
  [MODULE_METHOD](...args) {
    callNative('ModuleName', 'MethodName', args);
  }
  /**
   * Method with reponse
   */
  [MODULE_METHOD_WITH_RESPONSE](...args) {
    return callNativeWithPromise('ModuleName', 'MethodWithResposne', args);
  }
}
```

The `ModuleName`, `MethodName` and arguments must be confirmed with native developers.

## Migrate from React Native

The most difference in `React Native` and `Hippy React` have three points:

1. Touch event system
2. Animation
3. Compoents

### Touch event system

The touch event is able to apply to `View` component directly, for example the `onPress` event:

```javascript
import React from 'react';
import { View, Text } from '@hippy/react';

function Container() {
  function clickHandler(eventName) {
    console.log(eventName, 'is trigged');
  }

  return (
    <View>
      { /* `onClick` event is supported to instead of `onPress`  */ }
      <View onClick={() => clickHandler('click')}><Text>Trigger click event</Text></View>

      { /* But `onPress`still supported for forward compatibility  */ }
      <View onPress={() => clickHandler('press')}><Text>Trigger click event</Text></View>
    </View>
  );
}
```
