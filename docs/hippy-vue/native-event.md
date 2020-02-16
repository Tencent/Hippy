# 终端事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

在 hippy-vue 中，所有终端事件都是分发到 Vue 的实例上（范例中实例名为 `app`），通过 Vue 的内部事件机制进行分发的。

# 事件监听器

这里是向前端发送一个名叫 rotate 的事件，里面有个参数是 result，这样就发送到前端去了。

```js
// 将入口文件中 setApp() 时保存的 Vue 实例取出来。
const app = getApp();

export default {
  method: {
    listener(rsp) {
      console.log(rsp.result);
    }
  },
  didMount() {
    // 通过 app 监听 rotate 事件，并通过 this.listener 在事件发生时触发回调。
    app.$on('rotate', this.listener);
  }
}

```

# 事件卸载

如果不需要使用的时候记得调用一下移除监听的方法，一般放在组件的卸载生命周期中执行。

```jsx
app.$off('rotate', this.listener);
```
