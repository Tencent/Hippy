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

# Custom Components & Modules

In @hippy/vue-next, the `registerElement` method is also available for registering custom components and mapping tags in the template to native components.
It is worth noting that, similar to Native, in @hippy/vue, the `registerElement` method is attached to the global Vue object.
Similarly, in @hippy/vue-next, the `registerElement` method is also exported separately.

```javascript
import { registerElement } from '@hippy/vue-next';
```

## Register Custom Component

```javascript
// custom-tag.ts
import { registerElement } from '@hippy/vue-next'

/**
 * register custom tag
 */
export function registerCustomTag(): void {
  // native component name
  const nativeComponentName = 'CustomTagView'
  // custom tag name
  const htmlTagName = 'h-custom-tag'
  // register native custom component named "CustomTagView", native component name must same with native real name.
  // this method establish mapping between our "h-custom-tag" to native "CustomTagView"
  registerElement(htmlTagName, {
      component: {
          name: nativeComponentName
      }
  })
}

// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';
import { registerCustomTag } from './custom-tag'

// register
registerCustomTag()

// create hippy app instance
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name, required, use demo for test
  appName: 'Demo',
});

// ...other code

```

## Binding Native Event Return Values

Because @hippy/vue-next adopts a consistent event model with the browser and aims to unify events on both ends (sometimes the return values of events may differ),
a solution was implemented to manually modify the event return values. This requires explicitly declaring the return values for each event.
This step is handled during the registration of custom components using the `processEventData` method, which takes two parameters.

- evtData Include event instance `handler` and event name `__evt`
- nativeEventParams native event real return values

Eg: @hippy/vue-next's [swiper](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-next/src/native-component/swiper.ts) native component,
it was the real rendered node by `swiper` that handle the event return values

```javascript
  // register swiper tag
  registerElement('hi-swiper', {
    component: {
      name: 'ViewPager', // native component name
      processEventData(
        evtData: EventsUnionType,
        nativeEventParams: { [key: string]: NeedToTyped },
      ) {
        // handler: event instance，__evt: native event name
        const { handler: event, __evt: nativeEventName } = evtData;
        switch (nativeEventName) {
          case 'onPageSelected':
            // Explicitly assigning the value of nativeEventParams from the native event to the event bound to the event in @hippy/vue-next
            // This way, the event parameters received in the pageSelected event of the swiper component will include currentSlide.
            event.currentSlide = nativeEventParams.position;
            break;
          case 'onPageScroll':
            event.nextSlide = nativeEventParams.position;
            event.offset = nativeEventParams.offset;
            break;
          case 'onPageScrollStateChanged':
            event.state = nativeEventParams.pageScrollState;
            break;
          default:
        }
        return event;
      },
    },
  });
```

## Use `Vue` Component Implement Custom Component

When your custom component involves more complex interactions, events, and lifecycle methods, simply using `registerElement` may not be sufficient.
It can only achieve basic mapping of element names to components and basic parameter mapping. In such cases, you can use Vue to register separate
components to implement this complex custom component. For information on registering components in Vue, you can refer to the [Component Registration](https://cn.vuejs.org/guide/components/registration.html) guide.
Please note that there are some differences in component registration between Vue 3 and Vue 2.
You can also refer to the implementation of [swiper](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-next/src/native-component/swiper.ts) components in the @hippy/vue library

### Event Handle

When using components registered with Vue, if you want to pass terminal events to the outer component, you need to handle it differently.
There are two ways to achieve this.

- Use `render` Function(Recommend)

```javascript
import { createApp } from 'vue'

const vueApp = createApp({})

// notice Vue3 register component isn't global now 
vueApp.component('Swiper', {
  // ... other code
  render() {
    /*
     * Use "render" function
     * "pageScroll" is the event name passed to native(automaticlly transform to "onPageScroll")
     * "dragging" is the event name user used
     */
    const on = getEventRedirects.call(this, [
      ['dropped', 'pageSelected'],
      ['dragging', 'pageScroll'],
      ['stateChanged', 'pageScrollStateChanged'],
    ]);

    return h(
      'hi-swiper',
      {
        ...on,
        ref: 'swiper',
        initialPage: this.$initialSlide,
      },
      this.$slots.default ? this.$slots.default() : null,
    );
  },
});

// register native custom component "ViewPager"
registerElement('hi-swiper', {
  component: {
    name: 'ViewPager',
  },
});
```


- Use Vue `SFC`

```javascript
// swiper.vue
<template>
  <hi-swiper
    :initialPage="$initialSlide"
  >
    <slot />
  </hi-swiper>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
  
export default defineComponent({
  props: {
    $initialSlide: {
      type: Number,
      default: 0,
    }
  },
  created() {
    // In Vue 3, events are also stored in the $attrs property of the component, just like other attributes. The only difference is
    // that events are stored in the format of onXXX, whereas in Vue 2, they are stored in the on property.
    if (this.$attrs['onDropped']) {
        // The "onDropped" event is named "onPageSelected" in native side, when use register "onDropped",
        // we should assign the handler to "onPageSelected" too.
        // When native trigger "pageSelected" event, the "onDropped" event handler will be executed
        this.$attrs['onPageSelected'] = this.$attrs['onDropped']
    }
  }
})
</script>

// app.ts
import { registerElement } from '@hippy/vue-next'
import { createApp } from 'vue'
import Swiper from './swiper.vue'

// register custom native component
registerElement('hi-swiper', {
  component: {
    name: 'ViewPager',
  },
});

// create vue instance
const vueApp = createApp({})
// register vue component
vueApp.component('Swiper', Swiper)
```

> When registering a custom tag using the Single File Component (SFC) approach, Vue treats it as a component. However, if the component is not explicitly registered,
> it will result in an error. Therefore, we need to use isCustomElement to inform Vue that this is our [custom component](https://cn.vuejs.org/api/application.html#app-config-compileroptions-iscustomelement),
> just render directly.
> Attention, hippy-webpack.dev.js, hippy-webpack.android.js, hippy-webpack.ios.js both need to be handled, first by development builds and other for production builds.

```javascript
// src/scripts/hippy-webpack.dev.js & src/scripts/hippy-webpack.android.js & src/scripts/hippy-webpack.ios.js both need to be handled

/**
 * determine tag is custom tag or not, should handle by your project
 */
function isCustomTag(tag) {
  return tag === 'hi-swiper'
}

// vue loader part
{
  test: /\.vue$/,
  use: [
    {
      loader: 'vue-loader',
      options: {
        compilerOptions: {
          // disable vue3 dom patch flag，because hippy do not support innerHTML
          hoistStatic: false,
          // whitespace handler, default is 'condense', it can be set 'preserve'
          whitespace: 'condense',
          // register custom element that won't transform as Vue component
          isCustomElement: tag => isCustomTag(tag)
        },
      },
    },
  ],
},
```

# Server Side Render

@hippy/vue-next is now supported SSR, the specific code can be viewed in [Demo](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-ssr-demo)'s SSR Part
, For the implementation and principle of Vue SSR, you can refer to the [official document](https://cn.vuejs.org/guide/scaling-up/ssr.html)。

## How To Use SSR

Read `How To Use SSR` in [Demo](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-ssr-demo)

## Principle

### SSR Architecture

<img src="en-us/assets/img/hippy-vue-next-ssr-arch-en.png" alt="hippy-vue-next SSR Architecture" width="80%"/>

### Description

The implementation of @hippy/vue-next SSR involves three operating environments: compile time, client runtime, and server runtime. On the basis of vue-next ssr, we developed @hippy/vue-next-server-renderer
Used for server-side runtime node rendering, developed @hippy/vue-next-compiler-ssr for compiling vue template files at compile time. And @hippy/vue-next-style-parser for server-side rendering
Style insertion for Native Node List. Let's illustrate what @hippy/vue-next SSR does through the compilation and runtime process of a template

We have a template like `<div id="test" class="test-class"></div>`

- Compiler

  Through @hippy/vue-next-compiler-ssr, our template transform to render funtions like

  ```javascript
  _push(`{"id":${ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"class":"test-class","id": "test",},"children":[]},`)
  ```

- Server Side Runtime

  Through @hippy/vue-next-server-renderer, render function obtained during compilation is executed to obtain the json object of the corresponding node.
  Note that the ssrGetUniqueId method in the render function is provided in @hippy/vue-next-server-renderer, where the server-renderer will also process
  the attribute values of the nodes, and finally get the json object of the Native Node

   ```javascript
   { "id":1,"index":0,"name":"View","tagName":"div","props":{"class":"test-class","id": "test",},"children":[] }
   ```

  > For the handwritten non-sfc template rendering function, it cannot be processed in the compiler, and it is also executed in the server-renderer

- Client Side Runtime

  Through @hippy/vue-next-style-parser, nodes returned by server are insert styles, and insert node props by @hippy/vue-next. Then insert native nodes to
  native to complete rendering node on screen.
  After the node is inserted to the screen, the asynchronous jsBundle on the client side is loaded asynchronously through the global.dynamicLoad provided
  by the system to complete the Hydrate on the client side and execute the follow-up process.

## Different

There are some differences between the Demo initialization of the SSR version and the initialization of the asynchronous version. Here is a detailed description of the differences

- src/main-native.ts Change

1. Use createSSRApp to replace the previous createApp, createApp only supports CSR rendering, while createSSRApp supports both CSR and SSR
2. The ssrNodeList parameter is added during initialization as the Hydrate initialization node list. Here the initialized node list returned by our server is stored in global.hippySSRNodes, and pass it as a parameter to createSSRApp when calling it.
3. Call app.mount after router.isReady is completed, because if you don’t wait for the routing to complete, it will be different from the node rendered by the server, causing Hydrate to report an error

```javascript
- import { createApp } from '@hippy/vue-next';
+ import { createSSRApp } from '@hippy/vue-next';
- const app: HippyApp = createApp(App, {
+ const app: HippyApp = createSSRApp(App, {
    // ssr rendered node list, use for hydration
+   ssrNodeList: global.hippySSRNodes,
});
+ router.isReady().then(() => {
+   // mount app
+   app.mount('#root');
+ });
```

- src/main-server.ts Add

main-server.ts is the business jsBundle running on the server side, so no code splitting is required. The whole can be built as a bundle. Its core function is to complete the first-screen rendering logic on the server side, process the obtained first-screen Hippy node, insert node attributes and store (if it exists), and return.
And return the maximum uniqueId of the currently generated node for subsequent use by the client.

>Note that the server-side code is executed synchronously. If a data request is made asynchronously, the request may have been returned before the data is obtained. For this problem, Vue SSR provides a dedicated API to handle this problem:
>[onServerPrefetch](https://cn.vuejs.org/api/composition-api-lifecycle.html#onserverprefetch).
>There is also an example of using onServerPrefetch in app.vue of [Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-ssr-demo/src/app.vue)

- server.ts Add

server.ts is the entry file executed by the server. Its role is to provide a Web Server, receive the SSR CGI request from the client, and return the result to the client as response data, including the rendering node list, store, and global style list.

- src/main-client.ts Add

main-client.ts is the entry file executed by the client. Unlike the previous pure client rendering, the client entry file of SSR only includes the request to obtain the first screen node, insert the first screen node style, and insert the node into the terminal to complete the rendering. related logic.

- src/ssr-node-ops.ts Add

ssr-node-ops.ts encapsulates the operation logic of inserting, updating, and deleting SSR nodes that do not depend on @hippy/vue-next runtime.

- src/webpack-plugin.ts Add

webpack-plugin.ts encapsulates the initialization logic of Hippy App required for SSR rendering.


# Additional Differences

@hippy/vue-next is basically functionally aligned with @hippy/vue now, but the APIs are slightly different from @hippy/vue, and there are still some problems that have not been solved, here is the description:

- Vue.Native

  In @hippy/vue, the capabilities provided by Native are provided by the Native attribute mounted on the global Vue. In Vue3.x, this implementation is no longer feasible. You can access Native as follows:

  ```javascript
  import { Native } from '@hippy/vue-next';
  
  console.log('do somethig', Native.xxx)
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

  !> vue@3.2.45+ has fixed this [problem](https://github.com/vuejs/core/pull/7049). When developing with version 3.2.45 and above, the components in keep-alive can also be hot updated

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

- whitespace handler

  Vue2.x Vue-Loader `compilerOptions.whitespace` default is `preserve`, Vue3.x default is  `condense`(refer to [Vue3 whitespace introduction](https://vuejs.org/api/application.html#app-config-compileroptions-whitespace)).

  Disable `trim` is different from Vue2.x, which will be set in `createApp` options.

  ```javascript
    // entry file
    const app: HippyApp = createApp(App, {
     // hippy native module name
     appName: 'Demo',
     // trimWhitespace default is true
     trimWhitespace: false,
    });

    //  webpack script
    rules: [
    {
        test: /\.vue$/,
        use: [
        {
          loader: vueLoader,
          options: {
              compilerOptions: {
                // whitespace handler, default is 'condense'
                whitespace: 'condense',
              },
          },
        }],
     },
    ]
  ```

- dialog

  The first child element of `<dialog>` cannot be set style `{ position: absolute }`. If you want to cover full screen by the content of `<dialog>`, you can set `{ flex: 1 }` or explicit with/height value for the first child element, which is consistent with Hippy3.0.

# Examples

For more details, please check [example project](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo) directly.
