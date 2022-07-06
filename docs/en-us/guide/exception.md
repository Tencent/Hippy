# Exception Handler

## uncaughtException

Hippy can catch unexpected errors that are not handled in JS code by listening `uncaughtException` events.

```javascript
    global.Hippy.on('uncaughtException', (...args) => {
        // Errors can be reported here
        report('[uncaughtException]', ...args);
    });
```

## unhandledRejection

The `unhandledRejection` event is sent to the global scope of a script when a JavaScript Promise that has no rejection handler is rejected.

!> Currently only support iOS(JSCore) to capture `unhandledRejection` error by js polyfill ，Android(V8) not supported yet.

### iOS

> Minimum supported version `2.14.1`

+ `npm install -D @hippy/rejection-tracking-polyfill`

+ Import `polyfill`

```javascript

// import by webpack config
module.exports = {
    entry: {
        // import polyfill code
        index: ['@hippy/rejection-tracking-polyfill', 'dist/dev/index.js']
    },
}

// or import by business code, take hippy-react for example
import { Hippy } from '@hippy/react';
import '@hippy/rejection-tracking-polyfill';

new Hippy({
  appName: 'Demo',
  entryPage: App,
}).start();
```

+ Listening `unhandledRejection`

```javascript
global.Hippy.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', error.stack, error.message);
});
```
