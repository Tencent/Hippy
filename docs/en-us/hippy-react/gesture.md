# Gesture System

Gesture system of hippy is relatively more convenient to use. The main difference is that it does not need to rely on other event components. All components including View, Text, Image or various custom controls can listen to click events and touch events.

---

# Click Events

Click events include four types: long press, click, press and finger lift, which are notified by the following four interfaces:

1. onClick: this function is called when the control is clicked.
2. onPressIn: this function is called when the user starts to touch the screen (that is, when the user presses the finger) when the control is long pressed or clicked.
3. onPressOut: this function is called when the user finishes touching the screen (that is, when the user lifts his finger) when the control is long pressed or clicked.
4. onLongClick： this function is called when the control is long pressed.

## Example

The click state effect can be achieved by using onPressIn and onPressOut together. For example, the following example code realizes the function of changing the background color when clicked:

```jsx
render()
{
    let bgColor = "#FFFFFF"; // The background is white in the non-clicked state
    if (this.state.pressedIn) {
        bgColor = "#000000"; // The background is black when clicked
    }

    return (
        <View style={{backgroundColor: bgColor}}
              onPressIn={() => {
                  this.setState({pressedIn: true})
              }}
              onPressOut={() => {
                  this.setState({pressedIn: false})
              }}
        >
            button
        </View>
    );
}
```

# Touch Events

Touch events are handled similarly to click events and can be used on any React component. Touch events are mainly composed of the following callback functions:

1. onTouchDown(event)： When the user starts to press the finger on the control, this function is called back and the touch screen point information is passed in as a parameter.
2. onTouchMove(event)： When the user moves the finger in the control, this function is called continuously and the touch point information of the control is informed through the event parameter.
3. onTouchEnd(event)： When the touch screen operation ends, this function is called back when the user lifts his finger on the control, and the event parameter will also notify the current touch screen point information.
4. onTouchCancel(event)： This function will be called back when a system event interrupts the touch screen during the user's touch screen process, such as incoming phone calls, component changes (such as setting hidden), sliding gestures of other components, and will inform the front-end touch screen point information through event parameter. `Note: If onTouchCancel is called, onTouchEnd will not be called.`

The above callback functions all take a parameter event, which contains the following structure:

- name: the name of the touch event,, corresponding to "onTouchDown,""onTouchMove,""onTouchEnd" and "onTouchCancel" respectively.
- id: the id of the target control that receives touch events. That is, the id of the control where the touch point is located.
- Page_x: the horizontal coordinate of the touch screen point relative to the root element.
- Page_y: the vertical coordinate of the touch screen point relative to the root element.

The x and y coordinates in the above structure have been converted to units independent of screen resolution. For example, the event parameter structure of the onTouchDown callback is as follows:

```json
{
  "name": "onTouchDown",
  "page_y": 172.27392578125,
  "id": 6574,
  "page_x": 532.6397094726562
}
```

# Event Bubble

[[Event bubble example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

Both click events and touch events can be defined in the callback function whether the event needs to be bubbled to the upper component. When a click or touch event occurs, the native will look for the lowest-level control declared under the touch screen point to handle the event.

> HippyReact does not bubble by default

1. Return `true` or `no return value`: After the View processing the event, it will no longer continue to bubble, and the entire gesture event processing ends.
2. Return `false`: After the View processing the event, it will continue to bubble up one level. If it finds a parent control that also sets the corresponding event handler, it will call the function and decide whether to continue to bubble according to its return value. . If the root node is reached during the upward bubbling process, the event bubbling ends.

After version `2.11.2`, the callback functions of the `onClick` and `onTouchEvent` events have added the `Event` instance parameter, which includes the `target` attribute (the actual emitting node of the event) and the `currentTarget` attribute (the node that listens for the event), `stopPropagation` method. `stopPropagation` can stop bubbling after global bubbling is enabled, and it takes precedence over the callback function `return return value`, which is gradually discarded after `return return value`.

We further illustrate the mechanism of event bubbling with the following example:

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onClick={() => {
                  console.log("Click root node");
              }}
        >
            <Text style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onClick={() => console.log("Click button1")}
            >
                button1
            </Text>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}
                  onClick={() => {
                      console.log("Click parent control");
                      // does not bubble up to the root node
                      return true;
                  }}
            >
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClick={() => {
                          console.log("Click button2");
                          // bubble up to the root node
                          return false;
                      }}
                >
                    button2
                </Text>
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClick={(event) => {
                          console.log("Click button2", event.target.nodeId, event.currentTarget.nodeId);
                          event.stopPropagation();
                          // After calling stopPropagation, even if return false, the button 2 click event will not bubble up to the parent node
                          return false;
                      }}
                >
                    button3
                </Text>
            </View>
        </View>
    );
}
```

> After version 2.10.1, it is supported to set default bubbling through the `bubbles` parameter during Hippy initialization (events are passed up, even if the event handler has no return value), the default `false`

```js
new Hippy({
    appName: 'Demo',
    entryPage: App,
    // set bubbles, default is false
    bubbles: true,
}).start();
````

# Event Capture

> Minimum supported version 2.11.5

[[Event capture examples]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

Click events and touch events support event capture. If you need to register the event handler in the capture phase, you should add the `Capture` suffix to the event name of the target element, such as `onClickCapture`, `onTouchDownCapture`.

For better performance optimization, Hippy does not enable capture by default if the target element does not have a `Capture` event handler, and the global bubbling configuration `bubbles: false` will not affect the capture enablement. The event capture design is consistent with web standards. When `stopPropagation` is called within any capture function, it will prevent the remaining capture phase, target node phase and bubbling phase from executing at the same time.

> Event capture will have a certain performance loss, if it is not necessary, try not to open it.

Example:

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onClick={() => {
                  console.log("click root node");
              }}
              onClickCapture={(event) => {
                  // If the root node has called stopPropagation, both button2's onClickCapture and button1's onClick are no longer called
                  // event.stopPropagation();
                  console.log("Click is captured by the root node")
              }}
        >
            <Text style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onClick={() => {
                      // Clicking on button 1 does not trigger the root node to capture the click
                      console.log("click button1")
                  }}
            >
                button1
            </Text>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}>
                <Text style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onClickCapture={() => {
                          // Clicking button2 triggers the root node to capture the click
                          console.log("click button2");
                      }}
                >
                    button2
                </Text>
            </View>
        </View>
    );
}
```

# Event Interception

In some scenarios, the parent control needs to intercept the gesture events of the child control first, so Hippy also provides a gesture event interception mechanism, which is controlled by two properties of the parent control: `onInterceptTouchEvent` and `onInterceptPullUpEvent`. These two properties are only valid for components that can contain child controls. Controls such as `<Image/>` do not support these two properties:

- onInterceptTouchEvent： This property determines whether the parent control intercepts gesture events of all child controls, true is intercepted, false is not intercepted (default is false). When the parent control sets this property to true, all its child controls will not receive any touch event and click event callbacks, regardless of whether event handlers are set. When pressing, moving, raising a finger, and clicking and long-pressing occur in the parent control area, the native sends events to the parent control for processing by default. If the child control is already processing touch events before the parent control sets onInterceptTouchEvent to true, then the child control will receive an onTouchCancel callback (if the child control has registered this function).
- onInterceptPullUpEvent： The function of this property is similar to onInterceptTouchEvent, but the conditions for determining whether the parent control intercepts the event are slightly different.When the value is true, when the user slides the finger up in the current parent control area, all subsequent touch events will be intercepted and processed by the parent control. All child controls will not receive any touch event callbacks, regardless of whether the event handler is set; if the child controls are already processing touch events before the interception takes effect, the child controls will receive an onTouchCancel callback. When false, the parent control will not intercept events, the default is false.

Note that due to the different interception conditions of these two properties, after the onInterceptTouchEvent flag is set to true, all touch events of the child control will be invalid, while onInterceptPullUpEvent will not affect the click event of the child control.

Let's take code as an example:

```js
render()
{
    return (
        <View style={{width: 300, height: 200, backgroundColor: "#FFFFFF"}}
              onTouchMove={(event) => {
                  console.log("root node TouchMove：" + JSON.stringify(event));
              }}
        >
            <View style={{width: 150, height: 100, backgroundColor: "#FF0000"}}
                  onTouchMove={evt => console.log("red area TouchMove：" + JSON.stringify(event))}
                  onTouchDown={(event) => {
                      console.log("red area onTouchDown：" + JSON.stringify(event));
                  }}/>
            <View style={{width: 150, height: 100, backgroundColor: "#00FF00"}}
                  onTouchMove={(event) => {
                      console.log("green area TouchMove：" + JSON.stringify(event));
                      return false;
                  }}
                  onInterceptTouchEvent={true}
            >
                <View style={{width: 80, height: 50, backgroundColor: "#0000FF"}}
                      onTouchMove={(event) => {
                          console.log("blue area TouchMove：" + JSON.stringify(event));
                          return false;
                      }}/>
            </View>
        </View>
    );
}
```
