# Customized Components and Modules

# Vue.registerElement

hippy-vue provides a `registerElement` method to register components, mapping tags in the template to native components.

## Example

```javascript
import Vue from 'vue';

/*
 * Register a ComponentName directly to the native component. Here, it is recommended to use the capital letter for the first letter.
 * <ComponentName /> can be used directly in the template.
 * ComponentName must match the name of the native component and cannot contain the Hippy character.
 */
Vue.registerElement('MyView');

/*
 * You can also register a lowercase tagname and map it to the ComponentName native component via the parameter
 * But tagname cannot be the same as the ComponentName even after ignoring case. (If the tag name is named my-view, the component name cannot be named MyView)
 * <tagname /> can be used directly in the template, it will also map to ComponentName components.
 * ComponentName must match the native component and cannot contain Hippy characters.
 */
Vue.registerElement('h-my-view', {
  component: {
    name: 'MyView',
  },
});
```

## Binding Native Event Return Value

Because hippy-vue uses the same event model as the browser, and hopes to unify the events at both ends (sometimes the return values of the events at both ends are different), so the scheme of manually modifying the return values of the events is adopted, and the return value of each event needs to be explicitly declared.

This step is processed by the `processEventData` method, it has three parameters:

* event: The event instance received in the native callback function, it needs to be modified
* nativeEventName: Native event name of the native
* nativeEventParams：Native event return body of the native

For example, the [hi-swiper component](//github.com/Tencent/Hippy/blob/master/packages/hippy-vue-native-components/src/swiper.js#L4) of hippy-vue is the counterpart node of the actual rendering of the swiper.

```javascript
component: {
  name: 'ViewPager',
  processEventData(event, nativeEventName, nativeEventParams) {
    switch (nativeEventName) {
    case 'onPageSelected':
      // Explicitly assign the value of the event parameter nativeEventParams of native to the event that hippyvue is really bound to
      event.currentSlide = nativeEventParams.position;
      break;
    case 'onPageScroll':
      event.nextSlide = nativeEventParams.position;
      event.offset = nativeEventParams.offset;
      break;
    default:
      break;
    }
    return event;
  }
}
```

# Vue.component

When you need to deal with more complex interactions, events, life cycle, you need to register a single component through `vue.component`, registerElement can only do the very basic mapping - element name mapping to component and basic parameter mapping.

For more information: //cn.vuejs.org/v2/guide/components-registration.html

## Event Handler

Customized components defined by `vue.component`, if you need to pass native events to the outer component, you need to do additional processing, there are two ways:

* use `render` function (recommend)

```javascript
  Vue.component('Swiper', {
    /*
     * You can use the render function
     * 'pageScroll' is the event name transmitted to the native (it will be automatically converted into onPageScroll during the transmission)
     * 'dragging' is the name of the event that is actually exposed to the user
     */
    render(h) {
        const on = {
            pageSelected: evt => this.$emit('dropped', evt),
            pageScroll: evt => this.$emit('dragging', evt),
            pageScrollStateChanged: evt => this.$emit('stateChanged', evt),
        };
        return h('hi-swiper', {
            on,
            ref: 'swiper',
            attrs: {
                initialPage: this.$initialSlide,
            },
        }, this.$slots.default);
    },
});
```

* Use `template`

```javascript
  Vue.component('Swiper', {
    /*
     * You can use a template, which HippyVue will convert it to a render function at run time
     * 'pageScroll' is the event name transmitted to the native (it will be automatically converted into onPageScroll during the transmission)
     * 'dragging' is the name of the event that is actually exposed to the user
     */
    template: `
      <hi-swiper
          :initialPage="$initialSlide"
          ref="swiper"
          @pageScroll="$emit('dragging', $event)"
          @pageScrollStateChanged="$emit('stateChanged', $event)"
          @pageSelected="$emit('dropped', $event)"
      >
      <slot />
      </hi-swiper>`,
});
```

# Customized Modules

> This example can only run under Android.

The hippy-vue module is just a `Vue.Native.callNative` call, you can only write a `function`.

```js
import Vue from 'vue';

function log(msg) {
  Vue.Native.callNative("TestModule", "log", msg)
}

function helloNative(msg) {
  Vue.Native.callNative("TestModule", "helloNative", msg)
}

// This one requires a native callback.
function helloNativeWithPromise(msg) {
  return Vue.Native.callNativeWithPromise("TestModule", "helloNativeWithPromise", msg);
}
```
