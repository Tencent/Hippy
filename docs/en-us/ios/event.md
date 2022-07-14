# Native Events

When the native network switches or the horizontal and vertical screens change, the native needs to send some global broadcast events to the front-end, so that the front-end can control the business state according to different states.

---

# Native Transmission

The native should call the following code where the event is sent:

```objectivec
// you can also refer to HippyEventObserverModule.m
[self sendEvent: @"rotate" params: @{@"foo":@"bar"}];
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params
{
    HippyAssertParam(eventName);
    // "EventDispatcher" & "receiveNativeEvent" are constants, cannot be changed
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}
```

# Front-end Reception

Here is a code snippet to send an event called `rotate` to the front-end. There is a parameter in the event called `result`. Reception processing is then performed at the front-end.

PS: the listener addition method of the latest version of Hippy has been changed from `addEventListener` to `addListener`

```jsx
import { HippyEventEmitter } from '@hippy/react';

let hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener("rotate", (e) => {
    // log result: { foo: 'bar' }
    console.log(e) ;
});
```

