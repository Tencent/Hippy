
# hippy-vue introduction

hippy-vue is based on the official vue 2.x source code, and implements a custom rendering layer by rewriting the [node-ops](//github.com/Tencent/Hippy/blob/master/packages/hippy-vue/src/runtime/node-ops.js) plug-in, but it is not only a rendering layer to the terminal, but also realizes the mapping of front-end components to the terminal and CSS syntax parsing. Unlike other cross-end frameworks, it strives to bring the Web-side development experience to the terminal while maintaining compatibility with the Web ecosystem.

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
