# Hippy Vue

> Write Hippy cross platform app with Vue Web technology.

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## Features

* Fully compatible with Vue ecosystem, include the directives and Vue-Router.
* Full compatible web development, able to output webpage, iOS, Android versions at one time.
* High quality assurance.
* Using flex layout by default.

## How to use

Just replace the runtime to `hippy-vue`, but if you require to use `Vue.Native` to retrieve the device properties,
write a `hippy-vue` alias to `vue` in webpack config will be ok.

```javascript
// import Vue from 'vue';
import Vue from '@hippy/vue'; // Replace original vue to hippy-vue, others are all the same.
```

## Advanced topics

### Custom component

`hippy-vue` has concepts of `Pure Component(Element)` is mapping to Native component, and `Component With Method(Vue custom component)`
define for the component with some methods.

#### Pure component(Element)

Pure component use for define the component and native mapping, for example:

**IMPORTANT:** Element can't with methods, need method, use `Vue.component()` in next section.

```javascript
import Vue from '@hippy/vue';

/*
 * Register the ComponentName as same as native defined directly
 * Use with <ComponentName /> in <template>
 */
Vue.registerElement('ComponentName');

/*
 * It's possible to register tagname with lowercase.
 * Then use `component.name` to map to native component defined.
 * However, tagname must not be the same as ComponentName after the case ignored.
 * Use with <tagname /> in <template>.
 */
Vue.registerElement('tagname', {
    component: {
        name: 'ComponentName',
    },
});
```

#### Component With Method(Vue custom component)

Use [Vue component registration](https://vuejs.org/v2/guide/components-registration.html) to define the component with methods.

For example:

```javascript
import Vue from 'hippy-vue';

// Define a `BeautyText` element
Vue.registerElement('BeautyText');

// Define the component with methods
Vue.component('btext', {
  methods: {
    // Custom the focus method
    focus() {
      // Use this.$refs.instance to pass the Node ID
      Vue.Native.callUIFunction(this.$refs.instance, 'focus', []);
    },
  },
  // Use the template to render the `BeautyText` component
  template: `<BeautyText ref="instance" />`,
})
```

#### Access the native capability.

All of native capability is encapsulated in `Vue.Native` property, with this property, app could determine running in
native app or web browsre.

The most important is the methods to call native methods:

* Vue.Native.callNative([MODULE], [METHOD], [ARGUMENTS]): call native module and methods.
* Vue.Native.callNativeWithPromise([MODULE], [METHOD], [ARGUMENTS]): call native module and methods with promise returns.
* Vue.Native.callUIFunction([REF], [METHOD], [ARGUMENTS]): call the UI function.

Access the native capability just create a simple function.

```javascript
import Vue from '@hippy/vue';

function callNativeCapability(...args) {
  Vue.Native.callNative('ModuleName', 'MethodName', args);
}
```

For more information, see `src/runtime/native.js`.

## Limitation

Because the native implementation there are some web browser features that can't support.

1. Percentage of size

All of percentage of size unit are can't support, we recommend to use Flex layout.

2. CSS Selector in style section of vue file

CSS Selector can't do complex query so far, but we will improve it.

## TODO

  A lot of things.

  1. ~~Convert CSS px unit value to pt.~~ -- implemented at 08/01/2018.
  2. ~~textarea value support, because in native value is a props.~~ - implemented at 08/06/2018.
  3. ~~v-if/v-show support, native framework should support display css property first.~~ - implemented at 08/28/2018.
  4. ~~v-model support, it's hard to handle onChange event.~~ - implemented at 08/22/2018.
  5. ~~transition support.~~ - Instead by animation component, implemented at 11/15/2018 released 1.1.9.
  6. Pseudo class selector event handler, such as `.class-name:hover`.
  7. Specific platform stylesheet.
  8. Form element and events.
  9. ~~vue-router integration.~~ - implemented at 08/31/2018.
  10. Split the values to multiple property for CSS loader.
  11. Style scope support
