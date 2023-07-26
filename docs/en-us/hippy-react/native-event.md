# Events

Some events are not sent to a single UI, but to the entire business, such as screen flips, network changes, etc., we call it `native events`.

Hippy provides two methods to manage global events:

+ `Hippy.on`, `Hippy.off`, `Hippy.emit` is framework-less Event Listener, mainly to listen to some special C++ events such as `dealloc`, `destroyInstance`. It can be also used to customize JS global events. 

+ `HippyEventEmitter` and `EventBus`(supported after 2.15.0) is HippyReact EventBus, which not only being used to customize JS global events, but also to handle all `NativeEvent` dispatching, such as `rotate` event.

---

# Event Listener

Here is an event called rotate sent to the front end, and one of its parameters is result, which is sent to the front end like this.

> PS：`HippyEventEmitter` do not need to be initialized repeatedly, recommend only once globally。

```jsx
import { HippyEventEmitter } from '@hippy/react';

const hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener('rotate', evt => console.log(evt.result));
```

# Event Remove

Remember to call the method of removing listeners when you don't need to use them, which are generally executed in the component's unload lifecycle.

```jsx
this.call.remove()
```

!> After version`2.15.0`, `EventBus` object is recommended to manage global events.

## EventBus

Minimum supported version `2.15.0`

### on

`(events: string | string[], callback: (data?: any) => void) => EventBus` used to listen to global events, `EventBus` object is returned for chaining call.

> + events: string | string[] - specify the event name，which has two types, `string` means to bind one event，`array` means to bind multiple events.
> + callback: (data?: any) => void - specify the callback function，which can be the second parameters of `EventBus.off`.

```js
import { EventBus } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
const accountChanged = (data) => {
  console.log('accountChanged data', data && data.user);
}
// Chaining call to regiser events
EventBus
  .on('rotate', rotateCallback)
  .on('accountChanged', accountChanged);
/*
  Array can be used to register two events.
  EventBus.on(['rotate1', 'rotate2'], rotateCallback)
 */
```

### off

`(events: string | string[], callback?: (data?: any) => void) => EventBus` used to remove global event listeners, `EventBus` object is returned for chaining call.
There are two options for usage: If only event name provided, it will remove all listeners of the event; If event name and callback provided, it will just remove the target listener of the event.

> + events: string | string[] - specify the event name，which has two types - `string` means to remove one event binding，`array` means to remove multiple events binding.
> + callback?: (data?: any) => void - optional parameter，which is mapped to the callback parameter of `EventBus.on`. When `callback` is empty, it will remove all listeners of the event.

```js
import { EventBus } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
EventBus.on('rotate', rotateCallback);
// Just remove the target listener of the event
EventBus.off('rotate', rotateCallback);
// Remove all listeners of the event
EventBus.off('rotate');
```

### emit

`(event: string, ...param: any) => EventBus` used to trigger event, `EventBus` object is returned for chaining call.

> + event: string - specify the event name, only single event supported.
> + ...param: any - optional, support to send multiple parameters, used as the arguments of callback function.


```js
import { EventBus } from '@hippy/react';
const rotateCallback = (data1, data2) => {
  console.log('rotate data', data1, data2);
}
EventBus.on('rotate', rotateCallback);
// Trigger rotate event with orientation paramters
EventBus.emit('rotate', { orientation: 'vertical' }, { degree: '90' });
```

### sizeOf

`(event: string) => number` used to get the total number of event listeners.

> + event: string - specify the event name.

```js
import { EventBus } from '@hippy/react';
const rotateCallback1 = (data) => {
  console.log('rotate data', data && data.orientation);
}
const rotateCallback2 = (data) => {
  console.log('rotate data', data && data.orientation);
}
EventBus.on('rotate', rotateCallback1);
EventBus.on('rotate', rotateCallback2);
// To get the total number of rotate event listeners
console.log(EventBus.sizeOf('rotate')); // => 2;
```


# JS Engine Destroy Event

`Minimum supported version 2.3.4`

This event will be triggered before the hippy js engine is destroyed to ensure that the last js code in the callback function is executed. The hippy business can do some operations when leaving by monitoring the `dealloc` event, but the callback function cannot use `async`

```jsx
Hippy.on('dealloc', () => {
    // do something
});
```

# RootView Destroy Event

`Minimum supported version 2.3.4`

This event is triggered when RootView is unloaded. unlike `dealloc`,  `destroyInstance` is triggered earlier than `dealloc`, but does not block the JS thread.

```jsx
Hippy.on('destroyInstance', () => {
    // do something
});
```

# Container Size Change Event

`Android all versions supported, iOS minimum supported version 2.16.0`

This event is triggered when the container size changes, such as screen rotation, folding screen switching, etc.

```jsx
import { HippyEventEmitter } from '@hippy/react';
const hippyEventEmitter = new HippyEventEmitter();
hippyEventEmitter.addListener('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: width before change;oldHeight: height before change;width: width after change; height: height after change
    console.log('size', oldWidth, oldHeight, width, height);
});
```

# System night mode change event

`Only supported by iOS, the minimum supported version is 2.16.6, (Note: The page will be recreated when Android modifies the night mode)`

This event is triggered when the system night mode changes

```jsx
import { HippyEventEmitter } from '@hippy/react';
const hippyEventEmitter = new HippyEventEmitter();
hippyEventEmitter. addListener('onNightModeChanged', ({ NightMode, RootViewTag }) => {
     // NightMode: whether the current night mode, the value is 0 or 1; RootViewTag: the Tag of the HippyRootView that sends the event
     console.log(`onDarkModeChanged: ${NightMode}, rootViewTag: ${RootViewTag}`);
});
```
