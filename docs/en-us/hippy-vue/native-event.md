# terminal event

Some events are not sent to a single UI, but to the whole business, such as the flip of the screen, the change of the network, etc., we call it `terminal events`.

In hippy-vue, all terminal events are distributed to the instance of vue (named `app` in the example) through Vue's internal event mechanism.

# event listener

Listen for the rotate event here, which has the callback parameter result.

```js
// Take out the Vue instance saved during setApp() in the entry file.
const app = getApp();

export default {
  method: {
    listener(rsp) {
      console.log(rsp.result);
    }
  },
  mounted() {
    // Listen to the rotate event through the app, and trigger a callback when the event occurs through this.listener.
    app.$on('rotate', this.listener);
  }
}

```

# Event Trigger

If you need to send events manually, you can trigger through `app.$`.

```js
const app = getApp();
app.$emit('rotate', { width: 100, height: 100 });
```

# Event Offload

If you don't need to use remember to call the remove listening method, generally on the component of the uninstall life cycle.

```js
const app = getApp();
app.$off('rotate', this.listener);
```

# Instance Destroy Event

`minimum supported version 2.3.4`

This event will be triggered when the hippy js engine or context is destroyed. The hippy business can do some operations when leaving by monitoring the `destroyInstance` event, but the callback function cannot use `async`

```jsx
Hippy.on('destroyInstance', () => {
    // do something
});
```

# Container Size Change Event

`Android only`

When the container size changes, such as screen rotation, folding screen switch, etc., will trigger the event

```jsx
app.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: old width；oldHeight: old height；width: new width; height: new height
    console.log('size', oldWidth, oldHeight, width, height);
});
```
