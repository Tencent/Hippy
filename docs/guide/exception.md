# 异常捕获

## uncaughtException

Hippy 对于 JS 代码里没有处理的异常错误，可以通过监听 `uncaughtException` 事件进行捕获。

```javascript
    global.Hippy.on('uncaughtException', (...args) => {
        // 此处可以做错误上报
        report('[uncaughtException]', ...args);
    });
```

## unhandledRejection

当 Promise 被 reject 且没有 reject 处理器的时候，会触发 `unhandledRejection` 事件

!> 当前只能通过 js polyfill 的方式捕获 iOS(JSCore) Promise 的 `unhandledRejection` 错误，Android(V8) 暂不支持。

### iOS

iOS 的 Promise 目前是采用 polyfill 的方式实现的，因此可以对 `unhandledRejection` 异常直接进行捕获。

由于 `rejection-tracking` 有一定的性能损耗，业务在有需要的时候才引入该插件。

> 最低支持版本 `2.14.1`

+ `npm install -D @hippy/rejection-tracking-polyfill`

+ 引入 `polyfill`

```javascript

// 可以在 iOS webpack config 配置
module.exports = {
    entry: {
        // 注入 polyfill 代码
        index: ['@hippy/rejection-tracking-polyfill', 'dist/dev/index.js']
    },
}

// 也可以在业务代码里直接引入，以 hippy-react 举例
import { Hippy } from '@hippy/react';
import '@hippy/rejection-tracking-polyfill';

new Hippy({
  appName: 'Demo',
  entryPage: App,
}).start();
```

+ 监听错误

```javascript
global.Hippy.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});
```
