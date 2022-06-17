
# hippy-vue introduction

hippy-vue is based on the official vue 2.x source code, and implements a custom rendering layer by rewriting the [node-ops](//github.com/Tencent/Hippy/blob/master/packages/hippy-vue/src/runtime/node-ops.js) plug-in, but it is not only a rendering layer to the terminal, but also realizes the mapping of front-end components to the terminal and CSS syntax parsing. Unlike other cross-end frameworks, it strives to bring the Web-side development experience to the terminal while maintaining compatibility with the Web ecosystem.

> Vue 3 provides a better [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154) method to customize the render, eliminating the need for node-ops plug-ins in the future. Hippy-vue will also be rewritten by Typescript.

# Architecture Diagram

<img src="assets/img/hippy-vue.png" alt="hippy-vue architecture diagram" width="80%"/>
<br />
<br />

# Initialization

```javascript
import Vue from '@hippy/vue';
import App from './app.vue';
const app = new Vue({
  // App name specified by terminal
  appName: 'Demo',
  rootView: '#root',
  // Render entrance
  render: h => h(App),
});

/**
  * $start is a callback triggered after Hippy is started
  *  @param {Function} callback - callback function after successful engine loading
  *  @param {Object} instance - instance object of vue
  *  @param {Object} initialProps - initial parameters given from terminal to front-end, some customer attributes needed to startup can be put in the entry file.
  */
app.$start((instance, initialProps) => {
  console.log('instance', instance, 'initialProps', initialProps);
});

//If you need to get the initialProps on the first View rendering, you can read app.$options.$superProps directly

```   

# Style

Standard Hippy does not allow units of length - but for browser compatibility, hippy-vue uses the 1px = 1pt conversion scheme - which removes the px from the CSS unit and turns it into a number without units in Hippy.

However, there are still some problems. If relative units such as rem and vh are written into Hippy business, it may be more important to find and avoid more significant risks in time. Therefore, only px units are converted now, and other units are allowed to be reported errors at the terminal level.

HippyVue provides `beforeLoadStyle` Vue options hook function, for developers to do custom modify CSS styles, such as

```js
    new Vue({
      // ...
      beforeLoadStyle(decl) {
         let { type, property, value } = decl;
         console.log('property|value', property, value); // => height, 1rem
          // For example, process the rem units 
         if(typeof value === 'string' && /rem$/.test(value)) {
             // ...value = xxx
         } 
         return { ...decl, value}
      }
    });
```

# CSS selector and support for scope

At present, the basic `ID`、`Class`、`Tag` selectors have been implemented, and the basic nesting relationship can be supported. The rest selectors and scoped are not supported yet.

# Switch to Web

In the future, Hippy will adopt the `WebRenderer` solution and add a conversion layer based on the public communication protocol. The business developers can use the business codes developed by the same Hippy syntax to map them into the components and modules implemented by JS. The upper layer can be compatible with React, Vue or other third-party frameworks. Please look forward to it.
