<!-- markdownlint-disable no-duplicate-header  -->
<!-- markdownlint-disable no-blacks-blockquote -->

# 动态加载

## 介绍

Hippy 2.2版本之前只支持加载单个js文件。随着业务越来越复杂，单个js文件体积越来越大。为了解决这个问题，Hippy 在 2.2 版本增添了动态加载能力，Hippy 的开发人员可以按需来动态引入js文件。

 `最低版本支持 2.2`

## 范例

[[React 范例]](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/DyanmicImport/index.jsx)

[[Vue 范例]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-dynamicimport.vue)

## 使用方法

### 安装

`npm install @tencent/hippy-dynamic-plugin`

### 使用

在`webpack`中引入组件

```javascript
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');

module.exports = {
  entry: {
    index: 'example.js',
  },
  output: {
    filename: 'example.output.js',
    strictModuleExceptionHandling: true,
    path: path.resolve('./dist/'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new HippyDynamicImportPlugin(),
  ],
};
```

### 降级方案

在终端不支持 dynamic import 的版本，可以利用Webpack提供的 `/* webpackMode: "eager" */` 注释停止生成额外的chunk。

```javascript
// 在import()中增加magic comment例子如下：
AsyncComponent: () => import(/* webpackMode: "eager" */ './dynamicImport/async-component.vue'),
```

具体原理可以参看[webpack](https://webpack.docschina.org/api/module-methods/)

## TODO

+ 支持网络加载分包
+ Hippy 2.2以下可以直接不用webpack注释来兼容
