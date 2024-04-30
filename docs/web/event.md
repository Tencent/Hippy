# Web 事件

当浏览器加载结束或者使用了一些三方库完成一些功能后需要向业务侧抛出事件。

---

# 事件发送

WebRenderer 在需要发送事件的地方调用以下代码：

## 在模块中

 发送事件，`HippyWebModule` 基类提供的 `context` 提供了向业务层发送事件的能力

```javascript
const eventName = '自定义名字';
const param = {};
context.sendEvent(eventName, param);
```

## 在 component 中

 发送事件，`HippyWebView` 基类的 `context` 提供了向业务层发送事件的能力

```javascript
const eventName = '自定义名字';
const param = {};
context.sendEvent(eventName, param);
```

## 在全局中

 发送事件，`Hippy.web.engine` 的 `context` 提供了向业务层发送事件的能力

```javascript
const engine = Hippy.web.engine;
const eventName = '自定义名字';
const param = {};
engine.context.sendEvent(eventName, param);
```

# 前端业务监听事件

[hippy-react 监听事件](hippy-react/native-event.md?id=事件监听器)

[hippy-vue 监听事件](hippy-vue/native-event.md?id=事件监听器)
