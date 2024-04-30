# Hippy Web Renderer

> 将基于 `hippy-react` 和 `hippy-vue`框架开发完成的结果运行到浏览器上

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## 介绍
`@hippy/web-renderer`是与终端渲染层等价的方案，用以将 `hippy-react` 和 `hippy-vue`的构建产物运行到浏览器上。
跟 `hippy-react` 和 `hippy-vue`保持了一样到接口。
该项目目前还在持续的建设中

## 特性
* 使用更android和ios一样的方案，对`hippy-react` 和 `hippy-vue`的产物进行解析并渲染成符合预期的效果。从机制和结果上与native侧保持高度一致性
* 可以同时支持前端的react和vue框架，甚至是未来的其它前端ui框架。
* 使用与android和ios一样的构建产物，无需为web场景单独构建产物。在一些场景下甚至可以替代android或ios的渲染方式，如：高频ui交互的场景。

## 使用方法

```javascript
import { Hippy } from '@hippy/react';
import App from './app';

new Hippy({
  appName: 'Demo',
  entryPage: App,
  silent: false,
}).start();

```

## 限制

因为浏览器和终端的实现有所不同，部分特性无法实现（Javascript 也无法 hack），这就需要开发者进行额外的适配或者在web场景下丢弃某些特性。

如：状态栏的样式颜色修改，锁定屏幕方向以及一些android或ios系统独有的特性如：ios的list子节点滑动删除

hippy的方案是一个ui框架，所以在web场景下需要自己处理如：url信息的解析，参数传递给应用。补充与开发者自定义的终端组件或模块等价的前端组件或模块。

因为 `hippy-react` 和 `hippy-vue`有较多的与环境信息中的OS参数耦合的，必须要是android或者是ios。所以Web-Renderer为了让这两个框架能够统一的运行下去，
将环境信息中的OS参数设置成了android,并且所有的参数、事件分发的形式都是按照android的分发标准进行的。

## 待办事宜

    1. WaterfallView组件补充
    2. AnimationSet模块的补充
    3. Platform-Localization模块的补充
    4. Dynamic-load能力的补充
    5. List.rowShouldSticky\bounces\overScrollEnabled\showScrollIndicator\rowShouldSticky属性补充
    6. ScrollView.scrollIndicatorInsets\showScrollIndicator\showsHorizontalScrollIndicator\showsVerticalScrollIndicator属性补充
    7. Image.capInsets属性补充
 
