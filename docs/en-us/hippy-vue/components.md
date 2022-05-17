<!-- markdownlint-disable no-duplicate-header -->

# Core Components

The definition of core components is consistent with the browser and Vue. It can be directly across the browser if only uses these components.

---

# a

This component is currently mapped to the terminal Text component and is currently used primarily for page jumps in hippy-vue-router. All the same with [p](hippy-vue/components.md?id=p).

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# button

[[Sample：demo-button.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-button.vue)

This component is mapped to the View component, and the container can be used to place pictures and texts. But because the View can't wrap text, so you need to package in the `<button>` other text components to display text, this is not the same as the browser, the browser `<button>` can also package `<span>` components, pay attention to when developing. The same as [div](hippyvue/components.md?id=div).

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| click       | This callback function is called when the button is clicked. For example, `@click="clickHandler"` | `Function`                                | `Android、iOS`    |
| longClick   | This callback function is called when the button is long pressed. For example, `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS`    |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# div

[[Sample：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

> div component container. By default, scrolling is not allowed. Can increase the style parameters `overflow-y: scroll` switch to vertical scroll container, or increase the style parameters `overflow-x: scroll` switch to scroll container horizontally. On the terminal side will be mapped to [ScrollView](hippy-react/components.md?id=ScrollView), so it has the same capabilities as [ScrollView](hippy-react/components.md?id=ScrollView).

## parameter

| parameter               | description                                                         | type                                 | supported platform  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessibilityLabel | Sets the text read by a "screen reader" (an accessibility feature for the visually impaired) when the user interacts with this element.By default, the literal is constructed by iterating through all the child elements and adding up all the text tags. | `string`                               | `Android、iOS`     |
| accessible         | When this property is `true`, it indicates that the view is an element with accessibility enabled. By default, all touchable elements are accessibility elements.| `boolean`                            | `Android、iOS`     |
| collapsable        | If a `div` is used only to lay out its children, it may be removed from the native layout tree for optimization, so references to the node's DOM will be lost `(e.g., a call to measureInAppWindow fails to get size and position information)`.  Setting this property to `false` disables this optimization to ensure that the corresponding view exists in the native structure. `(can also be set to the Style property)`| `boolean`                            | `Android` |
| style              | -                                                            | [`View Styles`](style/layout.md) | `Android、iOS`     |
| opacity            | Configuring the transparency of `View` also affects the transparency of child nodes       | `number`                             | `Android、iOS`     |
| overflow           | Specifies whether to clip content when the child overflows its parent `View` container | `enum(visible, hidden)`         | `Android、iOS`     |
| focusable          | Allows remote control to trigger View activation. True will trigger div `@focus` events.  You need to specify the NODE ID to which the four arrow keys will be moved by using `nextFocusDownId`, `nextFocusUpId`, `nextFocusLeftId`, and `nextFocusRightId` parameters      | `boolean`         | `Android`     |
| scrollEventThrottle            | Specifies the number of milliseconds (ms) at which the component will invoke the `onScroll` callback event. `(only applicable to overflow-y/x: scroll)` | `number`                                                     | `Android、iOS`    |
| pagingEnabled                  | When `true`, the scrollbar stops at an integer multiple of the scrollview's size.  This can be used for horizontal paging.  `default: false` `(only applicable to overflow-y/x: scroll)`| `boolean`                                                    | `Android、iOS`    |
| bounces | Whether to enable springback, default `true` `(only for overflow-y/x: scroll)` | `boolean`                                                  | `iOS`    |
| scrollEnabled                  | When the value is `false`, the content cannot scroll. `default: true` `(only applicable to overflow-y/x: scroll)` | `boolean`                                                    | `Android、iOS`    |
| showScrollIndicator            | Whether scroll bars are displayed. `default: false` `(only applicable to overflow-y/x: scroll)` | `boolean`  | `Android`    |
| showsHorizontalScrollIndicator | When set to `false`, `ScrollView` hides the horizontal scroll bar.  `default: true` `(only applies to overflow-y/x: scroll)`| `boolean`                                                    | `iOS`    |
| showsVerticalScrollIndicator   | When set to `false`, 'ScrollView' hides the vertical scroll bar.  `default: true` `(only applicable to overflow-y/x: scroll)`| `boolean`  | `iOS`   | 
| nativeBackgroundAndroid        | Configure water ripple effect, `minimum supported version 2.13.1`;  The configuration item is  `{borderless: Boolean, color: color, rippleRadius: number}`;  `Borderless` indicates whether or not the ripple has borders. Default is false;  `color` ripple color;  `rippleRadius` rippleRadius, if not set, the container border is the border by default;  ` note:  The water ripple is not displayed by default. You need to call setPressed and setHotspot methods in the corresponding touch event to display the water ripple.  Details refer to the relevant `[demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue) | `Object`| `Android`    |

---

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| attachedToWindow   | This event is emitted when the node has been rendered and added to the container component, and since Hippy's rendering is asynchronous, this is a safe event to perform subsequent operations on. | `Function`                           | `Android、iOS`     |
| click       | This callback function is called when the button is clicked. For example, `@click="clickHandler"` | `Function`                                | `Android、iOS`    |
| focus            | This event is triggered when `focusable` is set to true, and the active component can be moved by remote arrow keys. The event callback takes the `isFocused` parameter to mark the active and inactive states | `Function`  | `Android` |
| longClick   | This callback function is called when the button is long pressed. For example, `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS`    |
| layout           | Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                           | `Android、iOS`     |
| momentumScrollBegin  | Set when the ScrollView slider starts. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| momentumScrollEnd  | Set up at the end of the ScrollView slide. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| scroll  | This callback function can be called at most once per frame during scrolling. `(only applicable to overflow-y/x: scroll)`| `Function`                                | `Android、iOS`    |
| scrollBeginDrag  | Called when the user starts dragging the ScrollView. `(only applicable to overflow-y/x: scroll)`| `Function`                                | `Android、iOS`    |
| scrollEndDrag  | Called when the user stops dragging and dropping ScrollView. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

## method

### scrollTo

> This parameter is applicable only to overflow-y/x: scroll

`(x: number, y: number, duration: boolean) => void` Scroll to the specified X, Y offset, and the third parameter is whether to enable smooth scrolling animation.

> * x: number - X offset
> * y: number - Y offset
> * duration: number | boolean - The scroll time is in milliseconds. Default: 1000ms. False: 0ms


### setPressed

[[setPressed Sample]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`minimum supported version 2.13.1`

`(pressed: boolean) => void` Notifies the terminal whether the water ripple effect is currently required by passing in a Boolean value.

> * pressed: boolean - true displays water ripples, flase collects water ripples

### setHotspot

[[setHotspot Sample]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`minimum supported version 2.13.1`

`(x: number, y: number) => void` Notifies the terminal to set the current ripple center position by passing in an  `x, y` coordinate value.

---

# form

[[Sample：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

Container components. All the same [div](hippy-vue/components.md?id=div)。

---

# iframe

[[Sample：demo-iframe.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-iframe.vue)

Embedded web page container.

## parameter

| parameter               | description                                                         | type                                 | supported platform  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| src | Embedded url | `string`                               | `Android、iOS`     |
| method | request methods, `get`、`post` | `string`   | `Android、iOS`    |
| userAgent | Webview userAgent | `string` | `Android、iOS`|

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| load           | This event is triggered when the web page is successfully loaded | `(object: { url:string }) => void`    | `Android、iOS`     |
| loadStart           | This event is triggered when the web page starts loading | `(object: { url:string }) => void`    | `Android、iOS`     |
| loadEnd           | This event is triggered when the page ends loading | `(object: { url:string }) => void`    | `Android、iOS`     |

---

# img

[[Sample: demo-img.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)

Image component, same as browser.

> * Note: Width and height must be specified in the style or it will not work. 
> * Note: Android uses a grey background as a placeholder by default, so you can add `background-color: transparent` to make the image transparent.

## parameter

| parameter          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| src        | Picture address. Currently supported image formats are PNG, JPG, JPEG, BMP, GIF. | string                                | `Android、iOS`    |
| capInsets | When adjusting the IMG size, the corners specified by the capInsets are fixed without scaling, while the middle and rest of the sides are stretched.  This is useful for creating variable-sized rounded buttons, shadows, and other resources. |  `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS` | 
> Version `2.8.1` supports terminal local image capability, which can be loaded through webpack `file-loader`.  

## Special attributes within a style

| parameter               | description                                                         | type                                 | supported platform  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| resize-mode        |  Determines how to resize an image when the component size is out of proportion to the image size.  |  `enum (cover, contain, stretch, repeat, center)` | `Android、iOS`    |

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout      | Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                                                   | `Android、iOS`    |
| load        | This event is triggered when the web page is successfully loaded                | `Function`                                                   | `Android、iOS`    |
| loadStart   | This event is triggered when the web page starts loading | `Function`                                                   | `Android、iOS`    |
| loadEnd     | After loading, this callback function is called with or without success.                 | `Function`                                                   | `Android、iOS`    |
| error       | This callback is called when loading errors occur.| `Function`                                                   | `Android、iOS`    |
| progress    | In the process of loading calls, parameters for `nativeEvent: { loaded: number, total: number }`, `loaded`said the loading of the image size, `total` said the total size of the image.                                    | `iOS`    |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# input

[[Sample：demo-input.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-input.vue)

Single line text component.

>It is not recommended to manually bind data in both directions. It is recommended to bind views and data through `v-model` .

## difference

Due to differences in system component layer, if the input is in the position of the keyboard will be covered, after exhaled keyboard:

* iOS is normally covered
* Android's performance for the page will be the keyboard jacking, jacking range depends on the input of the Y axis position

We are still discussing how to address the platform differences here.

If there is a need for iOS to align Android keyboard jacking, it is recommended to refer to [StackOverflow](//stackoverflow.com/questions/32382892/ios-xcode-how-to-move-view-up-when-keyboard - appeals) and solve it at the business level.


### Solution to cover the interface after Android pops up

On some Android models, the keyboard after the pop - up may also produce cover interface, usually can be modified by `AndroidMainfest.xml` file, increase the android on the activity: windowSoftInputMode="adjustPan" to resolve.

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.tencent.mtt.hippy.example"
>
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
    >
        <!-- Attention android:windowSoftInputMode="adjustPan" is written in the parameters of activity-->
        <activity android:name=".MyActivity"
            android:windowSoftInputMode="adjustPan"
            android:label="@string/activity_name"
            android:configChanges="orientation|screenSize"
        >
        </activity>
    </application>
</manifest>
```

The meaning of this parameter is：

* adjustResize: resize the page content
* adjustPan: move page content without resizing page content

Please refer to the Android development documentation for details.

## parameter

| parameter                  | description                                      | type                                                         | supported platform  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------- |
| caret-color           | Enter the cursor color.(can also be set to the Style property) `Minimum supported version 2.11.5`| [`color`](style/color.md)        | `Android`     |
| defaultValue          | Provides an initial value in a text box.When the user starts typing, the value can change.  In some simple use cases, you can use defaultValue instead if you don't want to keep properties and state synchronized by listening for messages and then updating the value property. | `string`                                                     | `Android、iOS`     |
| editable              |  If false, the text box is not editable. `default: true`                        | `boolean`                                                    | `Android、iOS`     |
| type          | Determines what kind of soft keyboard pops up. Note that `password` only in the attribute `multiline=false` single line text box. | `enum(default, numeric, password, email, phone-pad)` | `Android、iOS`     |
| maxlength             | Limit the maximum number of characters in a text box.Using this property instead of JS logic to implement it, you can avoid flickering. | `numbers`                                                    | `Android、iOS`     |
| numberOfLines         | Set the `input` maximum display lines, if `input` no explicit set height, will be calculated according to `numberOfLines` height open.At the time of use must also set `multiline` parameter to `true`. | `number`                                                     | `Android`     |
| placeholder           | If no text is entered, this string is displayed.                        | `string`                                                     | `Android、iOS`     |
| placeholder-text-color  | Text color for placeholder string display.(can also be set to the Style property) `Minimum supported version 2.13.4` | [`color`](style/color.md)                                | `Android、iOS`     |
| underline-color-android  |  The color of the underline under `input`. Can be set to `transparent` to remove the bottom line.(can also be set to the Style property) `Minimum supported version 2.13.4`  | [`color`](style/color.md)                                                      | `Android` |
| returnKeyType         | Specifies the style of the soft keyboard's Enter key display.   | `enum(done, go, next, search, send)`              | `Android、iOS`     |
| value                 | Specifies the value of the `input` component.                        | `string`                                                     | `Android、iOS`     |

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| blur                | This callback function is called when the text box loses focus.    | `Function`                                                   | `Android、iOS`     |
| change          | This callback function is called when the contents of the text box change.The changed text is passed as a parameter. | `Function`                                                   | `Android、iOS`     |
| keyboardWillShow    | In the pop - up input keyboard will trigger the callback function, the return value contains the keyboard height `keyboardHeight`, style such as `{keyboardHeight: 260 }`| `Function`                                                   | `Android、iOS`     |
| keyboardWillHide     | This callback function will be triggered when hiding input keyboard.| `Function`                                                   | `Android`     |
| endEditing          | This callback function is called when the text input is complete.    | `Function`                                                   | `Android、iOS`     |
| layout              |  Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                                                   | `Android、iOS`     |
| selectionChange     | Called when the range of the input box selection text is changed.The style of the return parameters such as `{nativeEvent: { selection: { start, end } } }` | `Function`                                                   | `Android、iOS`     |

## method

### blur

`() => void` Causes the specified input component to lose cursor focus, the opposite of focus().

### clear

`() => void` Clear the contents of the input box.

### focus

`() => void` Assign input to get focus.

### getValue

`() => Promise<string>` Get the contents of the text box.

### setValue

`(value: string) => void` Sets the text box contents.

> * value: string - Text Box Contents

---

# label

[[Sample：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Show the text. All the same as [p](hippy-vue/components.md?id=p)。

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen.  | `Function`                                | `Android、iOS`    |

---

# ul

[[Sample：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

Hippy's key features, high performance reusable list components, on the terminal side will be mapped to `ListView`, contains `ListView` all ability. The first lay inside can only contain `<li>`.

## parameter

| parameter                  | description                                                         | type                                                        | supported platform |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| horizontal       | Specifies whether `ul` is laid out horizontally. `default: undefined` | `any`   | `Android`    |
| initialContentOffset  | The initial offset value.In the list of initialization can specify the scroll distance, avoid initialization and then through the scrollTo series method of flashing.Android support after `2.8.0 `  | `number`  | `Android、iOS` |
| bounces | Whether to open the rebound effect, default `true` | `boolean`                                                  | `iOS`    |
| overScrollEnabled | Whether to open the rebound effect, default `true` | `boolean`                                                  | `Android`    |
| rowShouldSticky  | Sets whether `ul` needs to turn on the hover ability, used in conjunction with `li` 's `sticky`. `default: false` | `boolean`  | `Android、iOS`
| scrollEnabled    | Whether the slide is on.`default: true` | `boolean` | `Android、iOS` |
| scrollEventThrottle   | Specify the sliding event callback frequency, the incoming value specifies how many milliseconds (ms) components will call a `onScroll` callback event, the default is 200 ms | `number`                                                    | `Android、iOS`    |
| showScrollIndicator   | Whether scroll bars are displayed. `default: true` | `boolean`                                                   | `iOS`    |
| preloadItemNumber     | Specifies the last row to fire the `endReached` callback when the list scrolls. | `number` | `Android、iOS` |
| exposureEventEnabled | Android exposure ability to enable switch, if you want to use the `appear` and `disappear` related events, Android needs to set the switch (iOS need not set), `default: true` | `boolean` | `Android`
| endReached | When all the data has been rendered and the list is scrolled to the last one, the `endReached` callback is triggered. | `Function`                                                  | `Android、iOS`    |
| editable | Editable, set to `true` when sideslip deletion is enabled. `minimum support version 2.9.0 `| `boolean`                                                  | `iOS`    |
| delText | Slippage deletes text. `minimum support version 2.9.0` | `string`                                                  | `iOS`    |

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| endReached          | When all the data has been rendered and the list is scrolled to the last one, the `endReached` callback is triggered.  | `Function`                                                  | `Android、iOS`    |
| momentumScrollBegin | In the `ListView` began to slide up                           | `Function`                                                  | `Android、iOS`    |
| momentumScrollEnd   | At the end of the `ListView` sliding up                         | `Function`                                                  | `Android、iOS`    |
| scroll              | When triggered `ListView` sliding event callback.Due to the `ListView` sliding callback, call will be very frequent, please use `scrollEventThrottle` frequency control. Note: ListView will recycle components when scrolling. Do not perform any ref node - level operations (such as all callUIFunctions and measureInAppWindow methods) on the ListItemView generated by renderRow() when scrolling. The recycled nodes will no longer be able to perform operations and report an error. Android supports horizontal ListView after version `2.8.0` | `(obj: { contentOffset: { x: number, y: number } }) => any` | `Android、iOS`    |
| scrollBeginDrag     | Called when the user starts dragging `ListView`.                         | `Function`                                                  | `Android、iOS`    |
| scrollEndDrag       | When the user stops dragging and dropping `ListView` or let `ListView` started sliding | `Function`                                                  | `Android、iOS`    |
| layout      | Called when an element is mounted or the layout is changed. The parameters are: `nativeEvent: {layout: {x, y, width, height}}` where `x` and `y` are the coordinate positions relative to the parent element. | `Function`                                | `Android、iOS`    |
| delete      | recall when a list item is sideslip and deleted. `minimum support version 2.9.0` | `(nativeEvent: { index: number}) => void`                                | `iOS`    |

## method

### scrollTo

`(xOffset: number, yOffset: number, animated: boolean) => void` Notify the ListView slide to a specific coordinate offset value (offset).

> * `xOffset`: number - Slide to offset in X direction
> * `yOffset`: number - Slide to offset in Y direction
> * `animated`: boolean - Whether the sliding process uses animation

### scrollToIndex

`(xIndex: number, yIndex: number, animated: boolean) => void` Notify the ListView slide to which an item.

> * `xIndex`: number - Slide to the xIndex item in the X direction
> * `yIndex`: number - Slide to yIndex items in Y direction
> * `animated`: boolean - Whether the sliding process uses animation

---

# li

ul child nodes, terminal layer node recycling and reuse of the minimum granularity.

[[Sample：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

## parameter

> When setting `ul`: `horizontal=true` When enabling horizontal infinite lists, explicitly set the `li` style width

| parameter                  | description                                                         | type                                                        | supported platform |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | Specify a function in which the type of the corresponding entry is returned (the natural number of the Number type is returned, and the default value is 0). List will reuse the entries of the same type, so reasonable type splitting can improve the performance of List. `Note: item components of the same type may not go through the complete component creation life cycle due to reuse.` | `number`              | `Android、iOS`    |
| key             | Specify a function in which the Key value of the corresponding entry is returned. See [Vue Official Document](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS`    |
| sticky       | Whether the corresponding item need to use the hover effect (scroll to the top, will hover at the top of the ListView, don't roll out of the screen), with `ul` `rowShouldSticky`| `boolean`                                | `Android、iOS`
| appear       | Triggering when a `li` node slides into the screen (exposure), the parameter returns the index value corresponding to the `li` node of the exposure. | `(index) => any` | `Android、iOS` |
| disappear       | Triggered when a `li` node slides away from the screen, and the parameter returns the index value corresponding to the `li` node that left. | `(index) => any` | `Android、iOS` |
| willAppear       | Triggered when at least one pixel of the `li` node slides into the screen (exposure), the input parameter returns the index value corresponding to the `li` node of the exposure. `minimum support version 2.3.0` | `(index) => any` | `Android、iOS` |
| willDisappear       | Triggers when a `li` node slides off the screen by at least one pixel. The parameter returns the index of the `li` node that left. `Minimum support version 2.3.0` | `(index) => any` | `Android、iOS` |

---

# p

[[Sample：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Display text, but because there is no `display: Inline` display mode, the default is all flex.

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

## parameter

| parameter          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | Used to trim text when it is too long.The total number of lines, including line breaks caused by folding, will not exceed the limit of this property. | `number`                                  | `Android、iOS`    |
| opacity       | Configure the transparency of the `View`, at the same time will affect the transparency of the child nodes.             | `number`                                  | `Android、iOS`    |
| ellipsizeMode* | When set the `numberOfLines` value, this parameter specifies how the string is truncated.So when using `ellipsizeMode` must be specified at the same time `numberOfLines` value. | `enum(head, middle, tail, clip)` | `Android only supports the tail attribute, iOS fully supports it`    |

* The meaning of parameters of ellipsizeMode：
  * `clip` - More than the specified number of lines of text will be truncated directly, do not show "...";(iOS only)
  * `head` - Text will be truncated from the beginning, to ensure that the string at the end of the text can be displayed at the end of the `Text` components, and from the beginning to truncate the text, will be "..." Instead, for example,"...wxyz ";(iOS only)
  * `middle` - "Text will be truncated from the middle to ensure that the last and first text of the string can be displayed in the response position of the Text component normally. and the text truncated in the middle will be"..." Instead, for example,"ab ab.."yz ";(iOS only)
  * `tail` - Text will be truncated from the end to ensure that the first text of the string can be displayed normally in the front of the Text component, and the text truncated from the end will be "..." Instead, for example,"abcd ...";

---

# span

[[Sample：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Show the text. All the same as [p](hippy-vue/components.md?id=p)。

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Touchscreen start event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Touchscreen move event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    |  Touchscreen end event, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Touchscreen cancel event. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen.  | `Function`                                | `Android、iOS`    |

---

# textarea

[[Sample：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-textarea.vue)

A multi-line text input box. All the same [input](hippy-vue/components.md?id=input)。
