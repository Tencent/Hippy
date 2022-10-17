# Hippy-Vue-Next

<br />

# Introduction

@hippy/vue-next is based on the existing logic of @hippy/vue, through the [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154) API provided by Vue3.x, there is no need to invade Vue code, and Vue can be directly referenced through external libraries, which can follow the Vue ecosystem in time, the implementation principle is basically the same as @hippy/vue.

@hippy/vue-next all code is written in typescript, which can have better program robustness and type hints. And the overall architecture of @hippy/vue-next has also been optimized.


# Architecture

<img src="en-us/assets/img/hippy-vue-next-arch-en.png" alt="hippy-vue-next structure" width="80%"/>
<br />
<br />

# How to use

The capabilities supported by @hippy/vue-next are basically the same as @hippy/vue. Therefore, there is no additional introduction about Hippy-Vue components, modules, styles, etc., you can refer to the relevant content in [Hippy-Vue](hippy-vue/introduction), this document only explains the differences.

## Initialization

```javascript
// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';

// To create a Hippy App instance, it should be noted that Vue3.x uses Typescript, and you need to use defineComponent to wrap the component object
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name must be set, the sample project can use Demo
  appName: 'Demo',
});

// start Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps is the initialization parameter passed in by Native. If you need to do routing preprocessing and other operations, you can let Native pass in the corresponding parameters
  // rootViewId is the id of the native root node mounted by the current Hippy instance of Native
  // mount app, render to screen 
  app.mount('#mount');
})
```

If you want to use Vue-Router, you need to use additional initialization logic

```javascript

// Vue + Vue Router

// app.vue
<template>
  <div><span>{{ msg }}</span></div>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const msg: string = 'This is the Root Page';
    return {
      msg,
    };
  },
});
</script>

// index.vue
<template>
  <div><span>{{ msg }}</span></div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const msg: string = 'This is the Index Page';
    return {
      msg,
    };
  },
});
</script>

// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';
import { createHippyRouter } from '@hippy/vue-router-next-history';
import { type Router } from 'vue-router';
import App from 'app.vue';

// To create a Hippy App instance, it should be noted that Vue3.x uses Typescript, and you need to use defineComponent to wrap the component object
const app: HippyApp = createApp(App, {
  // Hippy App Name must be set, the sample project can use Demo
  appName: 'Demo',
});

// routes list
const routes = [
  {
    path: '/',
    component: Index,
  },
];

// create router
const router: Router = createHippyRouter({
  routes,
});

// use router
app.use(router);

// start Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps is the initialization parameter passed in by Native. If you need to do routing preprocessing and other operations, you can let Native pass in the corresponding parameters
  // rootViewId is the id of the native root node mounted by the current Hippy instance of Native

  // Because the memory history of vue-router is now used, the initial position needs to be pushed manually, otherwise the router will not be ready
  // In the browser, vue-router matches according to location.href, and pushes the root path '/' by default. 
  // If you want to jump to the specified page by default like in the browser, you can let the native pass the initialized path from superProps,
  // and then perform operations such as router.push({ path: 'other path' }) through the value of path
  router.push('/');

  // mount app, render to screen 
  app.mount('#mount');
})
```

> @hippy/vue-router-next-history modify vue-router's history mode. Added the logic of returning the history record first when the hardware back key is triggered for Android.

If you don't need this, you can use original vue-router to implement routing：

```javascript
import { createRouter, createMemoryHistory, type Router } from 'vue-router';

// routes list
const routes = [
  {
    path: '/',
    component: Index,
  },
]; 

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
```

# Additional Differences

@hippy/vue-next is basically functionally aligned with @hippy/vue now, but the APIs are slightly different from @hippy/vue, and there are still some problems that have not been solved, here is the description:

- Vue.Native

  In @hippy/vue, the capabilities provided by Native are provided by the Native attribute mounted on the global Vue. In Vue3.x, this implementation is no longer feasible. You can access Native as follows: 

  ```javascript
  import { Native } from '@hippy/vue-next';
  
  console.log('do somethig', Native.xxx)
  ```

- registerElement

  In @hippy/vue, method `registerElement` used by Vue.registerElement，But with the same reason with Vue.Native, `registerElement` method in @hippy/vue-next needs exported from @hippy/vue-next .

  ```javascript
  import { registerElement } from '@hippy/vue-next';
  ```

- Global Event

  In @hippy/vue，global event used by `Vue.$on` or `Vue.$off`，now in @hippy/vue-next，we provide `EventBus` to do that.

  ```javascript
  import { EventBus } from '@hippy/vue-next';
  
  // Listen container size change event(Only Android)
  EventBus.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: old widht；oldHeight: old height；width: new width; height: new height
    console.log('size', oldWidth, oldHeight, width, height);
  });
  // trigger global event
  EventBus.$emit('eventName', {
    ...args, // event params
  });

- v-model directive

  Because the built-in instructions in Vue3.x are implemented by inserting code at compiling time, the v-model instruction has not yet been found a good way to deal with it. A temporary solution can be used to implement the corresponding function:

  ```javascript
  // For the specific usage, please refer to the example in demo-input.vue in demo
  <template>
    <input type="text" ref="inputRef" :value="textValue" @change="textValue = $event.value" />
    <div>
      <span>Input Value：{{ textValue }}</span>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, ref } from '@vue/runtime-core';
  
  export default defineComponent({
    setup() {
      const inputRef = ref(null);
      const textValue = ref('This is default value.');
      return {
        inputRef,
        textValue,
      };
    },
  }); 
  </script>
  ```

- HMR for Keep-Alive

  In the sample code, our routing component is wrapped in the Keep-Alive component, but currently the routing component wrapped with Keep-Alive cannot achieve hot update during development, and the entire instance needs to be refreshed to complete the refresh.
  There is no such problem if it is not wrapped in Keep-Alive. At present, the [official problem](https://github.com/vuejs/core/pull/5165) has not been resolved. The problem can be solved by upgrading Vue after waiting for the official solution.

- Vue3.x Proxy Value

  Because the reactivity of Vue3.x is implemented by "Proxy", so the object we get is actually an instance of Proxy instead of the original object, so we need to pay attention when calling the native interface, the native does not Know the Proxy object,
  You need to use the [`toRaw`](https://vuejs.org/api/reactivity-advanced.html#toraw) method provided by Vue3.x to get the original object and pass it to the native API.

- Type hints for native APIs and customized components

  @hippy/vue-next provides type hints for native APIs. 
  If there is a customized native api, it can also be extended in a similar way
  
  ```javascript
  declare module '@hippy/vue-next' {
    export interface NativeInterfaceMap {
      // then you can have type hints in Native.callNative, Native.callNativeWithPromise
    }
  }
  ```

  @hippy/vue-next also provides event types with reference to the event declaration of `lib.dom.d.ts`. For details, please refer to hippy-event.ts. If you need to extend the built-in events, you can use a similar way

  ```javascript
    declare module '@hippy/vue-next' {
      export interface HippyEvent {
        testProp: number;
      }
    }
  ```

  When using `registerElement` to register components, `type narrowing` is used to provide accurate type hints in switch cases. If you also need similar type hints when registering customized components, you can use the following methods:

  ```javascript
    export interface HippyGlobalEventHandlersEventMap {
      // extend new event name and related event interface
      onTest: CustomEvent;
      // extend existing event interface
      onAnotherTest: HippyEvent;
    }
  ```

  For more information, please refer to [extend.ts](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/src/extend.ts).

# Examples

For more details, please check [example project](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo) directly.
