# Web同构指引

这篇教程，讲述了如何将 Hippy 集成到 Web 页面中。

> 不同于 @hippy/react-web 和 @hippy/vue-web 方案，本方案（Web Renderer）不会替换 @hippy/react 和 @hippy/vue，而是将运行在原生环境下的 bundle 原封不动运行到 Web 上，与转译 Web 的方案各有利弊，业务可根据具体场景采用合适的方案

---

## 前期准备

- 模板文件：Web 运行需要一个 HTML 文件作为入口
- 入口文件：WebRenderer 是作为 Hippy bundle 的一个运行环境，因此不共享入口 JS 文件，应为其创建独立的入口文件

### npm script

在 demo 项目中，通过 `web:dev` 命令启动 WebRenderer 调试服务，通过 `web:build` 打包编译。

```json
  "scripts": {
    "web:dev": "npm run hippy:dev & node ./scripts/env-polyfill.js webpack serve --config ./scripts/hippy-webpack.web-renderer.dev.js",
    "web:build": "node ./scripts/env-polyfill.js
webpack --config ./scripts/hippy-webpack.web-renderer.js"
  }
```

### 启动调试

执行 `npm run web:dev` 启动 WebRenderer 调试，根据 demo 的 webpack 配置，WebRenderer 的 web 服务运行在`3000`端口，浏览器通过 `http://localhost:3000` 访问页面。

## 快速接入

WebRenderer 的执行应符合以下流程：

1. 导入 WebRenderer：该阶段会初始化 Hippy 代码运行的环境
2. 加载业务 bundle：这个 bundle 与 Native 侧运行的 bundle 包保持一致
3. 启动 WebRenderer：该阶段会加载 Hippy 内置组件和模块，也可以加载自定义组件和模块

### 导入 WebRenderer

#### 以 CDN 方式使用

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
    <!-- web renderer cdn url -->
    <!-- Hippy不提供cdn资源管理，需业务自行上传之类 -->
    <script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
    <script src="src/index.ts"></script>
  </body>
</html>
```

#### 以 NPM 包方式使用

```shell
npm install -S @hippy/web-renderer
```

在入口文件内添加：

```javascript
// 1. 导入 web renderer
import { HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// 2. 导入业务 bundle 的入口文件，需放在 web renderer 导入之后

// 3. 创建 web engine，如果有业务自定义模块和组件，从此处传入
```

### 加载业务 Bundle

加载 bundle 包有多种方式，可根据业务需要灵活选择，只需要确保引入顺序在 WebRenderer 之后即可

#### 在模板文件内引用加载

```html
<script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
<!-- 业务 bundle -->
<script src="//xxx.com/hippy-biz/index.bundle.js"></script>
<!-- 入口文件 -->
<script src="src/index.ts"></script>
```

#### 在入口文件内动态加载

```javascript
import { HippyWebEngine } from '@hippy/web-renderer';

const engine = HippyWebEngine.create();

 engine.load('https://xxxx.com/hippy-bundle/index.bundle.js').then(() => {
  engine.start({
    id: 'root',
    name: 'example',
  });
});
```

#### 业务源码直接引用

```javascript
import { HippyCallBack, HippyWebEngine, HippyWebModule, View } from '@hippy/web-renderer';
// 导入业务 bundle 的入口文件，需放在 web renderer 导入之后
import './main';


const engine = HippyWebEngine.create();
```

### 启动 WebRenderer

加载完业务 bundle 后，调用相关 API 创建并启动 WebRenderer

```js
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
  name: 'module-name',
  // 模块启动参数，业务自定义,
  // hippy-react 可以从 入口文件props里获取，hippy-vue可以从 app.$options.$superProps 里获取
  params: {
    path: '/home',
    singleModule: true,
    isSingleMode: true,
    business: '',
    data: { },
  },
});
```
