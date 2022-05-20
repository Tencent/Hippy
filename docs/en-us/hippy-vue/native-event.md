# Native Event

Some events are not sent to a single UI, but to the whole business, such as the flip of the screen, the change of the network, etc., we call it `native events`.

In hippy-vue, all native events are distributed to the instance of vue (named `app` in the example) through Vue's internal event mechanism.

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

# Event Trigger

If you need to send events manually, you can call through `app.$`.

```js
const app = getApp();
app.$emit('rotate', { width: 100, height: 100 });
```

# Event Offload

If you don't need to use, please remember to call the listening remove method. It is typically executed during the component's unload life cycle.

```js
const app = getApp();
app.$off('rotate', this.listener);
```

# Instance Destroy Event

`minimum supported version 2.3.4`

This event will be called when the hippy js engine or context is destroyed. The hippy business can do some operations when leaving by monitoring the `destroyInstance` event, but the callback function cannot use `async`

```jsx
Hippy.on('destroyInstance', () => {
    // do something
});
```

# Container Size Change Event

`Android only`

When the container size changes, such as screen rotation, folding screen switch, etc., this event will be called.

```jsx
app.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: old width；oldHeight: old height；width: new width; height: new height
    console.log('size', oldWidth, oldHeight, width, height);
});
```
