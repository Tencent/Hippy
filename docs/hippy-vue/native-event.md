# 事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

Hippy 提供了两种方式来管理全局事件:

+ `Hippy.on`、`Hippy.off`、`Hippy.emit` 是框架无关的全局事件 EventBus，主要用来监听如 `dealloc`、`destroyInstance` 等特殊 C++ 底层事件，也可以手动定制 JS 内的全局事件。

+ `app.$on`、`app.$off`、`app.$emit` 是 Vue 定制的 EventBus，除了可以手动定制 JS 内的全局事件外，所有全局 `NativeEvent` 都由其来分发，如 `rotate` 事件等。

---

# 事件监听器

这里监听 rotate 的事件，里面有回调参数 result。

```js
// 将入口文件中 setApp() 时保存的 Vue 实例取出来。
const app = getApp();

export default {
  method: {
    listener(rsp) {
      console.log(rsp.result);
    }
  },
  mounted() {
    // 通过 app 监听 rotate 事件，并通过 this.listener 在事件发生时触发回调。
    app.$on('rotate', this.listener);
  }
}

```

# 事件触发

如果需要手动发送事件，可以通过 `app.$emit` 触发。

```js
const app = getApp();
app.$emit('rotate', { width: 100, height: 100 });
```

# 事件卸载

如果不需要使用的时候记得调用一下移除监听的方法，一般放在组件的卸载生命周期中执行。

```js
const app = getApp();
app.$off('rotate', this.listener);
```

# JS 引擎销毁事件

`最低支持版本 2.3.4`

当 hippy js 引擎被销毁前会触发该事件，能够保证回调函数里的最后一句 js 代码被执行到，hippy 业务可以通过监听 `dealloc` 事件做一些离开时的操作，但回调函数不能使用 `async`

```jsx
Hippy.on('dealloc', () => {
    // do something
});
```

# 界面节点销毁事件

`最低支持版本 2.3.4`

当 RootView 被卸载时调用该事件，与 `dealloc` 不同的是该事件早于 `dealloc` 触发，但不会阻塞 JS 线程。

```jsx
Hippy.on('destroyInstance', () => {
  // do something
});
```

# 容器大小改变事件

`Android 全版本支持，iOS 最低支持版本 2.16.0`

当容器大小改变时，如屏幕旋转、折叠屏切换等，会触发该事件

```jsx
app.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: 旧的宽度；oldHeight: 旧的高度；width: 新的宽度; height: 新的高度
    console.log('size', oldWidth, oldHeight, width, height);
});
```

# 系统夜间模式改变事件

`仅iOS支持，最低支持版本 2.16.6，（注：Android修改夜间模式时页面将被重新创建）`

在当系统夜间模式发生改变时，会触发该事件

```jsx
app.$on('onNightModeChanged', ({ NightMode, RootViewTag }) => {
    // NightMode: 当前是否夜间模式，取值0或1；RootViewTag: 发送事件的HippyRootView的Tag
    console.log(`onDarkModeChanged: ${NightMode}, rootViewTag: ${RootViewTag}`);
});
```
