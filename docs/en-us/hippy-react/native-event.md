# Native event

Some events are not sent to a single UI, but to the entire business, such as screen flips, network changes, etc., we call it `native events`.

# Event Listener

Here is an event called rotate sent to the front end, and one of its parameters is result, which is sent to the front end like this.

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

`Only Android support`

This event is triggered when the container size changes, such as screen rotation, folding screen switching, etc.

```jsx
import { HippyEventEmitter } from '@hippy/react';
const hippyEventEmitter = new HippyEventEmitter();
hippyEventEmitter.addListener('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: width before change;oldHeight: height before change;width: width after change; height: height after change
    console.log('size', oldWidth, oldHeight, width, height);
});
```
