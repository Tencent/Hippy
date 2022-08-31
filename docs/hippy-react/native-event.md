# 终端事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

---

# 事件监听器

这里终端向前端发送一个名叫 `rotate` 的事件，里面包含参数 result，前端通过 `HippyEventEmitter.addListener` 监听事件。

> 注意：`HippyEventEmitter` 无需反复实例化，建议全局只初始化一次来复用。

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

!> `2.15.0` 版本后，增加 `HippyEvent` 全局事件对象，推荐采用该对象管理全局事件

## HippyEvent

最低支持版本 `2.15.0`

### on

`(events: string | string[], callback: (data?: any) => void) => HippyEvent` 用于监听全局事件，返回 `HippyEvent` 对象可用于链式调用。

> + events: string | string[] - 指定事件名称，可以有两种类型，传入字符串时用于绑定单个事件，传入数组时用于同时绑定多个事件。
> + callback: (data?: any) => void) - 指定回调函数，该回调函数可以作为 `HippyEvent.off` 的第二个参数。

```js
import { HippyEvent } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
const accountChanged = (data) => {
  console.log('accountChanged data', data && data.user);
}
// 链式调用注册事件
HippyEvent
  .on('rotate', rotateCallback)
  .on('accountChanged', accountChanged);
/*
  可以通过数组同时注册两个事件
  HippyEvent.on(['rotate1', 'rotate2'], rotateCallback)
 */
```

### off

`(events: string | string[], callback?: (data?: any) => void) => HippyEvent` 用于移除全局绑定的事件，返回 `HippyEvent` 对象可用于链式调用。
这里有两种使用方法，当只提供了事件名称，则移除对应事件的所有回调函数；当同时提供了事件名称和回调函数，则只移除事件上指定的回调函数。

> + events: string | string[] - 指定事件名称，可以有两种类型，传入字符串时用于移除单个事件，传入数组时用于同时移除多个事件。
> + callback?: (data?: any) => void - 可选参数，与 `HippyEvent.on` 第二个参数对应的回调函数，当 `callback` 为空时，移除对应事件的所有监听器。

```js
import { HippyEvent } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
HippyEvent.on('rotate', rotateCallback);
// 只移除事件上指定的回调函数
HippyEvent.off('rotate', rotateCallback);
// 移除对应事件的所有回调函数
HippyEvent.off('rotate');
```

### emit

`(event: string, param?: any) => HippyEvent` 用于触发对应事件，返回 `HippyEvent` 对象可用于链式调用。

> + event: string - 指定事件名称，只能传单个事件。
> + param?: any - 可选参数，用作回调函数的参数。


```js
import { HippyEvent } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
HippyEvent.on('rotate', rotateCallback);
// 触发 rotate 事件，并携带参数
HippyEvent.emit('rotate', { orientation: 'vertical' });
```

### sizeOf

`(event: string) => number` 用于获取对应事件所绑定的回调函数数量。

> + event: string - 指定事件名称。

```js
import { HippyEvent } from '@hippy/react';
const rotateCallback1 = (data) => {
  console.log('rotate data', data && data.orientation);
}
const rotateCallback2 = (data) => {
  console.log('rotate data', data && data.orientation);
}
HippyEvent.on('rotate', rotateCallback1);
HippyEvent.on('rotate', rotateCallback2);
// 获取 rotate 事件所绑定的回调函数数量
console.log(HippyEvent.sizeOf('rotate')); // => 2;
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
