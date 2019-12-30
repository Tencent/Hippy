# 终端事件

有一些事件不是发给单个 UI，而是发给整个业务的，例如屏幕的翻转、网络的变化等等，我们称之它为 `终端事件`。

# 事件监听器

这里是向前端发送一个名叫 rotate 的事件，里面有个参数是 result，这样就发送到前端去了。

```jsx
import { HippyEventEmitter } from '@tencent/hippy-react';

const hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener('rotate', evt => console.log(evt.result));
```

# 事件卸载

如果不需要使用的时候记得调用一下移除监听的方法，一般放在组件的卸载生命周期中执行。

```jsx
this.call.remove()
```
