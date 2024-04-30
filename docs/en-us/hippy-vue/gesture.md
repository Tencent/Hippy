# Gesture System

Gesture system of hippy is relatively more convenient to use. The main difference is that it does not need to rely on other event components. All components including div, p, label, img or various custom controls can listen to click events and touch events.

---

# Click Events

Click events include four types: long press, click, press and finger lift, which are notified by the following four interfaces:

1. click: this function is called when the control is clicked.
2longClick： this function is called when the control is long pressed.

## Example

The click state effect can be achieved by using onPressIn and onPressOut together. For example, the following example code realizes the function of changing the background color when clicked:

# Touch Events

Touch events are handled similarly to click events and can be used on any Vue component. Touch events are mainly composed of the following callback functions:

1. touchstart(event)： When the user starts to press the finger on the control, this function is called back and the touch screen point information is passed in as a parameter.
2. touchmove(event)： When the user moves the finger in the control, this function is called continuously and the touch point information of the control is informed through the event parameter.
3. touchend(event)： When the touch screen operation ends, this function is called back when the user lifts his finger on the control, and the event parameter will also notify the current touch screen point information.
4. touchcancel(event)： This function will be called back when a system event interrupts the touch screen during the user's touch screen process, such as incoming phone calls, component changes (such as setting hidden), sliding gestures of other components, and will inform the front-end touch screen point information through event parameter. `Note: If touchcancel is called, touchend will not be called.`

The above callback functions all take a parameter `Event` instance, which is similar to Web, including attributes `type`, `target`, `currentTarget`, `event params` and so on:

> After version 2.16.0,  `nativeParmas` attribute is added on `Event`, which contains all parameters sending from native.

# Event Bubble

[[Event bubble example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

Both click events and touch events can be defined in the callback function whether the event needs to be bubbled to the upper component. When a click or touch event occurs, the native will look for the lowest-level control declared under the touch screen point to handle the event.

HippyVue enables `bubbling` by default, you can use `stopPropagation` function or `stop` modifier to stop `bubbling`.

# Event Capture

Vue is not supported

# Event Interception

In some scenarios, the parent control needs to intercept the gesture events of the child control first, so Hippy also provides a gesture event interception mechanism, which is controlled by two properties of the parent control: `onInterceptTouchEvent` and `onInterceptPullUpEvent`. These two properties are only valid for components that can contain child controls. Controls such as `<img />` do not support these two properties:

- onInterceptTouchEvent： This property determines whether the parent control intercepts gesture events of all child controls, true is intercepted, false is not intercepted (default is false). When the parent control sets this property to true, all its child controls will not receive any touch event and click event callbacks, regardless of whether event handlers are set. When pressing, moving, raising a finger, and clicking and long-pressing occur in the parent control area, the native sends events to the parent control for processing by default. If the child control is already processing touch events before the parent control sets onInterceptTouchEvent to true, then the child control will receive an onTouchCancel callback (if the child control has registered this function).
- onInterceptPullUpEvent： The function of this property is similar to onInterceptTouchEvent, but the conditions for determining whether the parent control intercepts the event are slightly different.When the value is true, when the user slides the finger up in the current parent control area, all subsequent touch events will be intercepted and processed by the parent control. All child controls will not receive any touch event callbacks, regardless of whether the event handler is set; if the child controls are already processing touch events before the interception takes effect, the child controls will receive an onTouchCancel callback. When false, the parent control will not intercept events, the default is false.

Note that due to the different interception conditions of these two properties, after the onInterceptTouchEvent flag is set to true, all touch events of the child control will be invalid, while onInterceptPullUpEvent will not affect the click event of the child control.

Let's take code as an example:

```vue
<template>
   <div>
     <div :onInterceptTouchEvent="true">
           <div />
     </div>
   </div>
</template>
```
