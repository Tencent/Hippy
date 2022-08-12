# Web Event

When the browser finishes loading or uses some third-party libraries to complete some functions, it needs to throw events to the application side.

# Send event

The WebRenderer calls the following code where the event needs to be sent:

## In the module

To send events, the `context` provided by the `HippyWebModule` base class provides the ability to send events to the application layer

```javascript
const eventName = 'CustomName';
const param = {};
context.sendEvent(eventName, param);
```

## In the component

To send events, the `context` of the `HippyWebView` base class provides the ability to send events to the application layer

```javascript
const eventName = 'CustomName';
const param = {};
context.sendEvent(eventName, param);
```

## In the global

To send events, the `context` of `Hippy.web.engine` provides the ability to send events to the application layer

```javascript
const engine = Hippy.web.engine;
const eventName = 'CustomName';
const param = {};
engine.context.sendEvent(eventName, param);
```

# Front-end application listening events

[hippy-react listening events](hippy-react/native-event.md?id=EventListener)

[hippy-vue listening events](hippy-vue/native-event.md?id=EventListener)
