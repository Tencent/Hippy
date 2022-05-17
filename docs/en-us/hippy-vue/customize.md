# Custom Components and Modules

# Vue.registerElement

hippy-vue provides a `registerElement` method to register components, mapping tags in the template to native components.

## Example

```javascript
import Vue from 'vue';

/*
 * Register a ComponentName directly to the terminal component. Here, it is recommended to spell the first letter of the word with capital letters.
 * Can be used directly in the template<ComponentName />
 * ComponentName must match the name of the terminal component and cannot contain the Hippy character.
 */
Vue.registerElement('MyView');

/*
 * You can also register a lowercase tagname and map it to the ComponentName terminal component via the parameter
 * But tagname ignore case also cannot be the same as the ComponentName.(If the tag name is named my-view, the component name cannot be named MyView)
 * Can be used directly in the template,<tagname /> will also map ComponentName components.
 * ComponentName must match the name of the terminal component and cannot contain Hippy characters.
 */
Vue.registerElement('h-my-view', {
  component: {
    name: 'MyView',
  },
});
```

## Binding Terminal Event Return Value

Because hippy-vue uses the same event model as the browser, and hopes to unify the events at both ends (sometimes the return values of the events at both ends are different)- the scheme of manually modifying the return values of the events is adopted, and the return value of each event needs to be explicitly declared.

This step is in the registration component through `processEventData` method for processing, it has three parameters:

* event: The event instance received in the terminal callback function needs to be modified
* nativeEventName: Native event name of the endpoint
* nativeEventParams：Terminal native event return body

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

When you need to deal with more complex interactions, events, life cycle, need through the `vue.component` register a single component, registerElement can only do very basic element name to component mapping, and basic parameter mapping.

For more information: //cn.vuejs.org/v2/guide/components-registration.html

## event handler

Through `vue.component` custom components, if need to terminal events to the outer component, need to do additional processing, there are two ways:

* use that `render` function (recommend)

```javascript
  Vue.component('Swiper', {
    /*
     * You can use the render function
     * 'pageScroll' is transmitted to the terminal of the event name (transmission terminal will be automatically converted into into onPageScroll)
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

* use `template`

```javascript
  Vue.component('Swiper', {
    /*
     * You can use a template, which HippyVue converts to a render function at run time
     * 'pageScroll' is transmitted to the terminal of the event name (transmission terminal will be automatically converted to onPageScroll)
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

# Custom Modules

> This sample can only be run under Android.

The hippy-vue module is actually just a `Vue.Native.callNative` call, write a `function`.

```js
import Vue from 'vue';

function log(msg) {
  Vue.Native.callNative("TestModule", "log", msg)
}

function helloNative(msg) {
  Vue.Native.callNative("TestModule", "helloNative", msg)
}

// This is the need for terminal callback
function helloNativeWithPromise(msg) {
  return Vue.Native.callNativeWithPromise("TestModule", "helloNativeWithPromise", msg);
}
```
