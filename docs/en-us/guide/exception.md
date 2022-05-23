# Exception capture

Hippy can catch unexpected errors that are not handled in JS code by listening `uncaughtException` events.

!> currently `uncaughtException` unable to catch errors in `Promise`.

Usage:

```javascript
    global.Hippy.on('uncaughtException', (...args) => {
        // Errors can be reported here
        report('[uncaughtException]', ...args);
    });
```
