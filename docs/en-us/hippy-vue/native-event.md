# Events

Some events are not sent to a single UI, but to the whole business, such as the flip of the screen, the change of the network, etc., we call it `native events`.

Hippy provides two methods to manage global events:

+ `Hippy.on`, `Hippy.off`, `Hippy.emit` is framework-less EventBus, mainly to listen to some special C++ events such as `dealloc`, `destroyInstance`. It can be also used to customize JS global events.

+ `app.$on`, `app.$off`, `app.$emit` is Vue EventBus, which not only being used to customize JS global events, but also to handle all `NativeEvent` dispatching, such as `rotate` event.

---

# Event Listener

Listen for the rotate event here, which has the callback parameter result.

```js
// Take out the Vue instance saved in the entry file setApp().
const app = getApp();

export default {
  method: {
    listener(rsp) {
      console.log(rsp.result);
    }
  },
  mounted() {
    // Listen to the rotate event through the app, and call a callback through this.listener when the event occurs.
    app.$on('rotate', this.listener);
  }
}

```

# Event emit

If you need to send events manually, you can call through `app.$`.

```js
const app = getApp();
app.$emit('rotate', { width: 100, height: 100 });
```

# Event remove

If you don't need to use, please remember to call the listening remove method. It is typically executed during the component's unload life cycle.

```js
const app = getApp();
app.$off('rotate', this.listener);
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

When the container size changes, such as screen rotation, folding screen switch, etc., this event will be called.

```jsx
app.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: old width；oldHeight: old height；width: new width; height: new height
    console.log('size', oldWidth, oldHeight, width, height);
});
```

# System night mode change event

`Only supported by iOS, the minimum supported version is 2.16.6, (Note: The page will be recreated when Android modifies the night mode)`

This event is triggered when the system night mode changes

```jsx
app.$on('onNightModeChanged', ({ NightMode, RootViewTag }) => {
     // NightMode: whether the current night mode, the value is 0 or 1; RootViewTag: the Tag of the HippyRootView that sends the event
     console.log(`onDarkModeChanged: ${NightMode}, rootViewTag: ${RootViewTag}`);
});
```
