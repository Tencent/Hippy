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

web renderer 的使用可灵活选取不同方式，但都应符合以下顺序：

1. 导入 web renderer
2. 加载业务 bundle
3. 创建并启动 web renderer

## 以 NPM 包方式使用

```tsx
// 导入 web renderer
import { HippyCallBack, HippyWebEngine, HippyWebModule, View } from '@hippy/web-renderer';
// 导入业务 bundle 的入口文件，需放在 web renderer 导入之后
import './main';

// 创建 web engine，如果有业务自定义模块和组件，从此处传入
// 如果只使用官方模块和组件，则直接使用 const engine = HippyWebEngine.create() 即可
const engine = HippyWebEngine.create({
  modules: {
    CustomCommonModule,
  },
  components: {
    CustomPageView,
  },
});

// 启动 web renderer
engine.start({
  // 挂载的 dom id
  id: 'root',
  // 模块名
  name: 'hero-hot-list',
  // 模块启动参数，业务自定义
  params: {
    path: '/home',
    singleModule: true,
    isSingleMode: true,
    business: '',
    data: { ...params },
  },
});
```

## 以 CDN 方式使用

在模板文件内添加：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
    <script src="src/index.ts"></script>
  </body>
</html>
```

## 从外部加载现有的 Hippy bundle 文件

```tsx

import { HippyWebEngine } from '@hippy/web-renderer';

const engine = HippyWebEngine.create();

loadScript('https://xxxx.com/hippy-bundle/index.bundle.js').then(() => {
  engine.start({
    id: 'root',
    name: 'example',
  });
});
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
 
