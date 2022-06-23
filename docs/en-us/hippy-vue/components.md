<!-- markdownlint-disable no-duplicate-header -->

# Core Components

The definition of core components is consistent with the browser and Vue. It can be directly across the browser if only uses these components.

---

# a

This component is currently mapped to the native Text component and is currently used primarily for page jumps in hippy-vue-router. All the same with [p](hippy-vue/components.md?id=p).

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# button

[[Example：demo-button.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-button.vue)

This component is mapped to the View component, and the container can be used to place pictures and texts. But because the View can't wrap text, so you need to wrap other text components in the `<button>` to display text, this is not the same as the browser, the browser `<button>` can also wrap `<span>` components, so please pay attention to it when developing. All the same with [div](hippy-vue/components.md?id=div).

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| click       | Called when the button is clicked. For example, `@click="clickHandler"` | `Function`                                | `Android、iOS`    |
| longClick   | Called when the button is long pressed. For example, `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS`    |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# div

[[Example：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

> div component container. By default, scrolling is not allowed. `overflow-y: scroll` style attribute can be added to make it switch to vertical scroll container, `overflow-x: scroll` style attribute can be added to make it switch to horizontal scroll container. On the native side this will be mapped to [ScrollView](hippy-react/components.md?id=ScrollView), so it has the same capabilities as [ScrollView](hippy-react/components.md?id=ScrollView).

## Attributes

| Props               | Description                                                         | Type                                 | Supported Platforms  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessibilityLabel | Set the text read by a "screen reader" (an assistive function for people with visual impairment) when the user interacts with this element. By default, the literal is constructed by iterating through all the child elements and adding up all the text tags. | `string`                               | `Android、iOS`     |
| accessible         | When this property is `true`, it indicates that the view enables an accessibility element. By default, all touchable elements are accessibility elements.| `boolean`                            | `Android、iOS`     |
| collapsable        | If a `div` is used only to lay out its children, it may be removed from the native layout tree for optimization, so references to the node's DOM will be lost `(e.g., a call to measureInAppWindow fails to get size and position information)`. Setting this property to `false` disables this optimization to ensure that the corresponding view exists in the native trees. `(can also be set to the Style property)`| `boolean`                            | `Android` |
| style              | -                                                            | [`View Styles`](style/layout.md) | `Android、iOS`     |
| opacity            | Configures the transparency of `View`, also affects the transparency of child nodes at the same time      | `number`                             | `Android、iOS`     |
| overflow           | Specifies whether to clip content when the child overflows its parent `View` container | `enum(visible, hidden)`         | `Android、iOS`     |
| focusable          | Allows remote control to trigger View activation. The true status will trigger div `@focus` events. You need to specify the node ID to which the four arrow keys will be moved by using parameters `nextFocusDownId`, `nextFocusUpId`, `nextFocusLeftId`, and `nextFocusRightId`      | `boolean`         | `Android`     |
| scrollEventThrottle            | Specifies the number of milliseconds (ms) at which the component will invoke the `onScroll` callback event. `(only applicable to overflow-y/x: scroll)` | `number`                                                     | `Android、iOS`    |
| pagingEnabled                  | When `true`, the scrollbar stops at an integer multiple of the scrollview's size.  This can be used for horizontal paging.  `default: false` `(only applicable to overflow-y/x: scroll)`| `boolean`                                                    | `Android、iOS`    |
| bounces | Whether to enable springback, default `true` `(only for overflow-y/x: scroll)` | `boolean`                                                  | `iOS`    |
| scrollEnabled                  | When the value is `false`, the content cannot scroll. `default: true` `(only applicable to overflow-y/x: scroll)` | `boolean`                                                    | `Android、iOS`    |
| showScrollIndicator            | Whether scroll bars are displayed. `default: false` `(only applicable to overflow-y/x: scroll)` | `boolean`  | `Android`    |
| showsHorizontalScrollIndicator | When set to `false`, `ScrollView` hides the horizontal scroll bar.  `default: true` `(only applies to overflow-y/x: scroll)`| `boolean`                                                    | `iOS`    |
| showsVerticalScrollIndicator   | When set to `false`, 'ScrollView' hides the vertical scroll bar.  `default: true` `(only applicable to overflow-y/x: scroll)`| `boolean`  | `iOS`   | 
| nativeBackgroundAndroid        | Configure water ripple effect, `minimum supported version 2.13.1`; The configuration item is  `{borderless: Boolean, color: color, rippleRadius: number}`; `Borderless` indicates whether the ripple has borders. Default is false; `color` ripple color; `rippleRadius` ripple radius, if not set, the container border is the border by default;  ` note:  The water ripple is not displayed by default. You need to call setPressed and setHotspot methods in the corresponding touch event to display the water ripple.  Details refer to the relevant `[demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue) | `Object`| `Android`    |

---

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| attachedToWindow   | Called when the node has been rendered and added to the container component, and since Hippy's rendering is asynchronous, this is a safe event to perform subsequent operations on. | `Function`                           | `Android、iOS`     |
| click       | Called when the button is clicked. For example, `@click="clickHandler"` | `Function`                                | `Android、iOS`    |
| focus            | Called when `focusable` is set to true, and the active component can be moved by remote arrow keys. The event callback takes the `isFocused` parameter to mark the active and inactive states | `Function`  | `Android` |
| longClick   | Called when the button is long pressed. For example, `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS`    |
| layout           | Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                           | `Android、iOS`     |
| momentumScrollBegin  | Called when the ScrollView slider starts. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| momentumScrollEnd  | Called when the ScrollView slider ends. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| scroll  | Called at most once per frame during scrolling. `(only applicable to overflow-y/x: scroll)`| `Function`                                | `Android、iOS`    |
| scrollBeginDrag  | Called when the user starts dragging the ScrollView. `(only applicable to overflow-y/x: scroll)`| `Function`                                | `Android、iOS`    |
| scrollEndDrag  | Called when the user stops dragging and dropping ScrollView. `(only applicable to overflow-y/x: scroll)` | `Function`                                | `Android、iOS`    |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

## Methods

### scrollTo

> This parameter is applicable only to overflow-y/x: scroll

`(x: number, y: number, duration: boolean) => void` Scroll to the specified X, Y offset, and the third parameter is whether to enable smooth scrolling animation.

> * x: number - X offset
> * y: number - Y offset
> * duration: number | boolean - The scroll time is in milliseconds. Default: 1000ms. False: 0ms


### setPressed

[[setPressed Example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`minimum supported version 2.13.1`

`(pressed: boolean) => void` Notifies the native whether the water ripple effect is currently required by passing in a Boolean value.

> * pressed: boolean - true displays water ripples, flase: disable water ripples

### setHotspot

[[setHotspot Example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`minimum supported version 2.13.1`

`(x: number, y: number) => void` Notifies the native to set the current ripple center position by passing in an  `x, y` coordinate value.

---

# form

[[Example：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

Container components. All the same as [div](hippy-vue/components.md?id=div)。

---

# iframe

[[Example：demo-iframe.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-iframe.vue)

Embedded web page container.

## Attributes

| Props               | Description                                                         | Type                                 | Supported Platforms  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| src | Embedded url | `string`                               | `Android、iOS`     |
| method | request methods, `get`、`post` | `string`   | `Android、iOS`    |
| userAgent | Webview userAgent | `string` | `Android、iOS`|

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| load           | Called when the web page is successfully loaded | `(object: { url:string }) => void`    | `Android、iOS`     |
| loadStart           | Called when the web page starts loading | `(object: { url:string }) => void`    | `Android、iOS`     |
| loadEnd           | Called when the page ends loading | `(object: { url:string }) => void`    | `Android、iOS`     |

---

# img

[[Example: demo-img.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)

Image component, same as browser.

> * Note: Width and height must be specified in the style or it will not work. 
> * Note: Android uses a grey background as a placeholder by default, so you can add `background-color: transparent` to make the image transparent.

## Attributes

| Props          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| src        | Picture url. Currently supported image formats are PNG, JPG, JPEG, BMP, GIF. | string                                | `Android、iOS`    |
| capInsets | When adjusting the img size, the corners specified by the capInsets are fixed without scaling, while the middle and rest of the sides are stretched. This is useful for creating variable-sized rounded buttons, shadows, and other resources. |  `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS` | 
> Version `2.8.1` supports native local image capability, which can be loaded through webpack `file-loader`.  

## Special props within a style

| Props               | Description                                                         | Type                                 | Supported Platforms  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| resize-mode        |  Determines how to resize an image when the component size is out of proportion to the image size.  |  `enum (cover, contain, stretch, repeat, center)` | `Android、iOS`    |

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout      | Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                                                   | `Android、iOS`    |
| load        | Called when the web page is successfully loaded                | `Function`                                                   | `Android、iOS`    |
| loadStart   | Called when the web page starts loading | `Function`                                                   | `Android、iOS`    |
| loadEnd     | After loading, whether it successes or nor, this callback function is called with or without success    | `Function`                                                   | `Android、iOS`    |
| error       | Called when loading errors occur.| `Function`                                                   | `Android、iOS`    |
| progress    | In the process of loading calls, parameters `nativeEvent: { loaded: number, total: number }`, `loaded` indicate the size of the loading image, `total` indicates the total size of the image.                                    | `iOS`    |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

---

# input

[[Example：demo-input.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-input.vue)

Single line text component.

>It is not recommended for manual two-way data binding. It is recommended to bind views and data through `v-model`.

## Difference

Due to differences in system component layer, if the input is in the position of the keyboard will be covered, after exhaled keyboard:

* It can seen in iOS that the input is normally covered.
* It can seen in Android that the page is jacked up by the keyboard, depending on the Y-axis position of the input.  

We are still discussing how to address the platforms differences here.

If there is a need for iOS to align Android keyboard jacking, it is recommended to refer to [StackOverflow](//stackoverflow.com/questions/32382892/ios-xcode-how-to-move-view-up-when-keyboard-appeals) and solve it at the business level.


### Solution to the interface will be covered after popping up in Android

On some Android models, the keyboard may cover the interface after the pop-up, usually can be modified by `AndroidMainfest.xml` file, increase the android on the activity: windowSoftInputMode="adjustPan" to resolve.

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

## Attributes

| Props                  | Description                                      | Type                                                         | Supported Platforms  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------- |
| caret-color           | Enter the cursor color.(can also be set to the Style property) `Minimum supported version 2.11.5`| [`color`](style/color.md)        | `Android`     |
| defaultValue          | Provides an initial value in a text box. When the user starts typing, the value can change. In some simple use cases, you can use defaultValue instead if you don't want to keep properties and state synchronized by listening for messages and then updating the value property. | `string`                                                     | `Android、iOS`     |
| editable              |  If false, the text box is not editable. `default: true`                        | `boolean`                                                    | `Android、iOS`     |
| type          | Determines what kind of soft keyboard pops up. Note that `password` only in the attribute `multiline=false` single line text box. | `enum(default, numeric, password, email, phone-pad)` | `Android、iOS`     |
| maxlength             | Limit the maximum number of characters in a text box. Using this property instead of JS logic to implement it, you can avoid flickering. | `numbers`                                                    | `Android、iOS`     |
| numberOfLines         | Set the `input` maximum display lines, if `input` has no explicit set height, it will be calculated according to `numberOfLines` height. When using, `multiline` must to set to `true`. | `number`                                                     | `Android`     |
| placeholder           | If no text is entered, this string is displayed.                        | `string`                                                     | `Android、iOS`     |
| placeholder-text-color  | Text color for placeholder string displayed (can also be set to the Style property) `Minimum supported version 2.13.4`. | [`color`](style/color.md)                                | `Android、iOS`     |
| underline-color-android  |  The color of the underline under `input`. Can be set to `transparent` to remove the bottom line (can also be set to the Style property) `Minimum supported version 2.13.4`.  | [`color`](style/color.md)                                                      | `Android` |
| returnKeyType         | Specifies the style of the soft keyboard's Enter key displayed.   | `enum(done, go, next, search, send)`              | `Android、iOS`     |
| value                 | Specifies the value of the `input` component.                        | `string`                                                     | `Android、iOS`     |

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| blur                | Called when the text box loses focus.    | `Function`                                                   | `Android、iOS`     |
| change          | Called when the contents of the text box change. The changed text is passed as a parameter. | `Function`                                                   | `Android、iOS`     |
| keyboardWillShow    | Called when the input keyboard pops-up, the return value contains the keyboard height `keyboardHeight`, style such as `{keyboardHeight: 260 }`| `Function`                                                   | `Android、iOS`     |
| keyboardWillHide     | Called when hiding input keyboard.| `Function`                                                   | `Android`     |
| endEditing          | Called when the text input is complete.    | `Function`                                                   | `Android、iOS`     |
| layout              |  Called when an element is mounted or the layout changes. The argument is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are coordinates relative to the parent element | `Function`                                                   | `Android、iOS`     |
| selectionChange     | Called when the range of the input box selection text is changed.The style of the return parameters such as `{nativeEvent: { selection: { start, end } } }` | `Function`                                                   | `Android、iOS`     |

## Methods

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

[[Example：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Show the text. All the same as [p](hippy-vue/components.md?id=p)。

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen.  | `Function`                                | `Android、iOS`    |

---

# ul

[[Example：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

Hippy's key features, high performance reusable list components, on the native side will be mapped to `ListView`, contains all abilities of `ListView`. The first layer inside can only contain `<li>`.

## Attributes

| Props                  | Description                                                         | Type                                                        | Supported Platforms |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| horizontal       | Specifies whether `ul` is laid out horizontally. `default: undefined` | `any`   | `Android`    |
| initialContentOffset  | The initial offset value. In the list of initialization can specify the scroll distance, avoid flashing caused by series method of scrollT after oinitialization. Android supports after version ` 2.8.0 `  | `number`  | `Android、iOS` |
| bounces | Whether to open the rebound effect, default `true` | `boolean`                                                  | `iOS`    |
| overScrollEnabled | Whether to open the rebound effect, default `true` | `boolean`                                                  | `Android`    |
| rowShouldSticky  | Sets whether `ul` needs to turn on the hover ability, used in conjunction with `li` 's `sticky`. `default: false` | `boolean`  | `Android、iOS`
| scrollEnabled    | Whether the slide function is on.`default: true` | `boolean` | `Android、iOS` |
| scrollEventThrottle   | Specify the sliding event callback frequency, the incoming value specifies how many milliseconds (ms) components will call a `onScroll` callback event, the default is 200 ms | `number`                                                    | `Android、iOS`    |
| showScrollIndicator   | Whether scroll bars are displayed. `default: true` | `boolean`                                                   | `iOS`    |
| preloadItemNumber     | Specifies the number of rows that will call the `endReached` function when the list scrolls.| `number` | `Android、iOS` |
| exposureEventEnabled | The switch to enable Android exposure ability, if you want to use the `appear` and `disappear` related events, Android needs to set the switch (iOS need not set), `default: true` | `boolean` | `Android`
| endReached | When all the data has been rendered and the list is scrolled to the last one, the `endReached` callback is called. | `Function`                                                  | `Android、iOS`    |
| editable | Whether it is editable or not, set to `true` when sideslip deletion is enabled. ` minimum support version 2.9.0 `| `boolean`                                                  | `iOS`    |
| delText | Sideslip to delete text. `minimum support version 2.9.0` | `string`                                                  | `iOS`    |

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| endReached          | When all the data has been rendered and the list is scrolled to the last one, the `endReached` callback is called.  | `Function`                                                  | `Android、iOS`    |
| momentumScrollBegin | Called when the `ListView` began to slide                          | `Function`                                                  | `Android、iOS`    |
| momentumScrollEnd   | Called when the `ListView` end to slide                         | `Function`                                                  | `Android、iOS`    |
| scroll              | Called when the sliding event of `ListView` is triggered. Because this function is called when `ListView` is sliding, the call will be very frequent, please use `scrollEventThrottle` frequency control. Note: ListView will recycle components when scrolling. Do not perform any ref node-level operations (such as all callUIFunctions and measureInAppWindow methods) on the ListItemView generated by renderRow() when scrolling. The recycled nodes will no longer be able to perform operations and report an error. Android supports horizontal ListView after version `2.8.0` | `(obj: { contentOffset: { x: number, y: number } }) => any` | `Android、iOS`    |
| scrollBeginDrag     | Called when the user starts dragging `ListView`.                         | `Function`                                                  | `Android、iOS`    |
| scrollEndDrag       | Called when the user stops dragging and dropping `ListView` or let `ListView` started sliding | `Function`                                                  | `Android、iOS`    |
| layout      | Called when an element is mounted or the layout is changed. The parameters are: `nativeEvent: {layout: {x, y, width, height}}` where `x` and `y` are the coordinate positions relative to the parent element. | `Function`                                | `Android、iOS`    |
| delete      | Called when a list item is sideslip and deleted. `minimum support version 2.9.0` | `(nativeEvent: { index: number}) => void`                                | `iOS`    |

## Methods

### scrollTo

`(xOffset: number, yOffset: number, animated: boolean) => void` Notify the ListView slide to a specific coordinate offset value (offset).

> * `xOffset`: number - Slide to offset in X direction
> * `yOffset`: number - Slide to offset in Y direction
> * `animated`: boolean - Whether the sliding process uses animation

### scrollToIndex

`(xIndex: number, yIndex: number, animated: boolean) => void` Notify which item the ListView will slide to.

> * `xIndex`: number - Slide to xIndex items in the X direction
> * `yIndex`: number - Slide to yIndex items in Y direction
> * `animated`: boolean - Whether the sliding process uses animation

---

# li

ul's child nodes, the minimum granularity of the native layer node recycling and reuse.

[[Example：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

## Attributes

> When setting `ul`: `horizontal=true` When enabling horizontal infinite lists, explicitly set the `li` style width.

| Props                  | Description                                                         | Type                                                        | Supported Platforms |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | Specify a function in which the type of the corresponding entry is returned (the natural number of the Number type is returned, and the default value is 0). List will reuse the entries of the same type, so reasonable type splitting can improve the performance of List. `Note: item components of the same type may not go through the complete component creation life cycle due to reuse.` | `number`              | `Android、iOS`    |
| key             | Specify a function in which the Key value of the corresponding entry is returned. See [Vue Official Document](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS`    |
| sticky       | Whether the corresponding item needs to use the hover effect (scroll to the top, will hover at the top of the ListView, won't roll out of the screen), with `ul` `rowShouldSticky`| `boolean`                                | `Android、iOS`
| appear       | Called when a `li` node slides into the screen (exposure), the parameter returns the index value corresponding to the `li` node of the exposure. | `(index) => any` | `Android、iOS` |
| disappear       | Called when a `li` node slides away from the screen, and the parameter returns the index value corresponding to the `li` node that left. | `(index) => any` | `Android、iOS` |
| willAppear       | Called when at least one pixel of the `li` node slides into the screen (exposure), the input parameter returns the index value corresponding to the `li` node of the exposure. `minimum support version 2.3.0` | `(index) => any` | `Android、iOS` |
| willDisappear       | Called when a `li` node slides off the screen by at least one pixel. The parameter returns the index of the `li` node that left. `Minimum support version 2.3.0` | `(index) => any` | `Android、iOS` |

---

# p

[[Example：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Display text, but because there is no `display: Inline` display mode, the default is all flex.

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    | Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen. | `Function`                                | `Android、iOS`    |

## Attributes

| Props          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | Used to trim text when it is too long. The total number of lines, including line breaks caused by folding, will not exceed the limit of this property. | `number`                                  | `Android、iOS`    |
| opacity       | Configure the transparency of the `View`, at the same time will affect the transparency of the child nodes.             | `number`                                  | `Android、iOS`    |
| ellipsizeMode* | When set the `numberOfLines` value, this parameter specifies how the string is truncated. So when using `ellipsizeMode`, `numberOfLines` value must be specified at the same time. | `enum(head, middle, tail, clip)` | `Android only supports the tail attribute, iOS fully supports it`    |

* The meaning of parameters of ellipsizeMode：
  * `clip` - Texts that exceed the specified number of lines will be truncated directly, "..." will not shows;(iOS only)
  * `head` - Texts will be truncated from the beginning. To ensure that the string at the end of the text can be displayed at the end of the `Text` components, the texts will be truncated from the beginning. The truncated text will be replaced by "...". For example,"...wxyz ";(iOS only)
  * `middle` - Text will be truncated from the middle to ensure that the last and first text of the string can be displayed in the response position of the Text component normally. And the text truncated in the middle will be replaced by "..." For example,"ab ab.."yz ";(iOS only)
  * `tail` - Text will be truncated from the end to ensure that the first text of the string can be displayed normally in the front of the Text component, and the text truncated from the end will be replaced by "..." For example, "abcd ...";

---

# span

[[Example：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Show the text. All the same as [p](hippy-vue/components.md?id=p)。

## Events

| Event Name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | Called when screen touch starts, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchmove   | Called when screen touch moves, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchend    |  Called when screen touch ends, minimum supported version 2.6.2, the parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY` respectively represent the absolute position of the click within the screen. | `Function`                                | `Android、iOS`    |
| touchcancel | Called when screen touch cancels. When a system event interrupts the touch screen when the user touches the screen, such as an incoming phone call, a component change (e.g., set to hidden), or a sliding gesture of another component, this function will receive a callback. The minimum supported version is 2.6.2. The parameters are `evt: { touches: [{ clientX: number, clientY: number }] }`,`clientX` and `clientY`  respectively represent the absolute position of the click on the screen.  | `Function`                                | `Android、iOS`    |

---

# textarea

[[Example：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-textarea.vue)

A multi-line text input box. All the same as [input](hippy-vue/components.md?id=input)。
