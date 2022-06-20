# 前端事件

当浏览器加载结束或者实用了一些三方库完成一些功能后需要向业务侧抛出事件。

# 前端发送

前端在需要发送事件的地方调用代码：

## 在模块中

 >发送事件,`HippyWebModule`基类提供的`context`

```javascript
const eventName = '字定义名字';
const param = {};
context.sendEvent(eventName, param);
```

## 在component中

 >发送事件,`HippyWebView`基类提供的`context`

```javascript
const eventName = '字定义名字';
const param = {};
context.sendEvent(eventName, param);
```

## 在全局中

 >发送事件,`Hippy.web.engine`提供的`context`

```javascript
const engine = Hippy.web.engine;
const eventName = '字定义名字';
const param = {};
engine.context.sendEvent(eventName, param);
```
