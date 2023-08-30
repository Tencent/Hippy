# Hippy Web Renderer

> make results based on the `hippy-react` and `hippy-vue` frameworks run to the browser

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## Introduction
`@hippy/web-renderer`is equivalent to the native renderer，make results based on the `hippy-react` and `hippy-vue` frameworks run to the browser。

Keeps the same interface as `hippy-react` and `hippy-vue`

The project is working in progress

## Feature
* Use the same scheme as android and ios，use results based on the `hippy-react` and `hippy-vue` to render。Maintain a high degree of consistency with the native side in terms of mechanism and results
* Support `react` and `vue`。
* Results based on the `hippy-react` and `hippy-vue` frameworks,run directly on web、android and ios。

## How to use

```javascript
import { Hippy } from '@hippy/react';
import App from './app';

new Hippy({
  appName: 'Demo',
  entryPage: App,
  silent: false,
}).start();

```

## Limited

Due to differences in browser and native implementations,some feature not support (Javascript can't hack),at the moment developer need self-dispose。

example: change statue bar color。

Hippy is only a UI-Framework, you need to handle such as: url information parsing, and parameters passed to the application。
Supplement front-end components or modules that are equivalent to developer-defined terminal components or modules.

Due to `hippy-react` and `hippy-vue` have more coupling with `global OS parameters` in environment information,so the `OS` must be
`android` or `ios`.Web-Renderer set `OS` value `android`,and all callBack and event is same as android platform

## Wait to do

    1. WaterfallView Component support
    2. AnimationSet Component support
    3. Platform-Localization Component support
    4. List.rowShouldSticky\bounces\overScrollEnabled\showScrollIndicator\rowShouldSticky attribute support
    5. ScrollView.scrollIndicatorInsets\showScrollIndicator\showsHorizontalScrollIndicator\showsVerticalScrollIndicator attribute support
    6. Image.capInsets attribute support
 
