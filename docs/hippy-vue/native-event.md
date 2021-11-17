# 终端事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

在 hippy-vue 中，所有终端事件都是分发到 Vue 的实例上（范例中实例名为 `app`），通过 Vue 的内部事件机制进行分发的。

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

# 实例销毁事件

`最低支持版本 2.3.4`

当 hippy js 引擎或者 context 被销毁时会触发该事件，hippy 业务可以通过监听 `destroyInstance` 事件做一些离开时的操作，但回调函数不能使用 `async`

```jsx
Hippy.on('destroyInstance', () => {
    // do something
});
```

# 容器大小改变事件

`只有 Android 支持`

当容器大小改变时，如屏幕旋转、折叠屏切换等，会触发该事件

```jsx
app.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: 旧的宽度；oldHeight: 旧的高度；width: 新的宽度; height: 新的高度
    console.log('size', oldWidth, oldHeight, width, height);
});
```
