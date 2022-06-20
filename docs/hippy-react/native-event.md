# 终端事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

# 事件监听器

这里是向前端发送一个名叫 rotate 的事件，里面有个参数是 result，这样就发送到前端去了。

```jsx
import { HippyEventEmitter } from '@hippy/react';

const hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener('rotate', evt => console.log(evt.result));
```

# 事件卸载

如果不需要使用的时候记得调用一下移除监听的方法，一般放在组件的卸载生命周期中执行。

```jsx
this.call.remove()
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

`只有 Android 支持`

当容器大小改变时，如屏幕旋转、折叠屏切换等，会触发该事件

```jsx
import { HippyEventEmitter } from '@hippy/react';
const hippyEventEmitter = new HippyEventEmitter();
hippyEventEmitter.addListener('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: 旧的宽度；oldHeight: 旧的高度；width: 新的宽度; height: 新的高度
    console.log('size', oldWidth, oldHeight, width, height);
});
```
