# 异常捕获

Hippy 对于 JS 代码里没有处理的异常错误，可以通过监听 `uncaughtException` 事件进行捕获。

!> 当前 `uncaughtException` 暂时无法捕获 `Promise` 里的错误

用法：

```javascript
    global.Hippy.on('uncaughtException', (...args) => {
        // 此处可以做错误上报
        report('[uncaughtException]', ...args);
    });
```
