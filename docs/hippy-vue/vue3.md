# Hippy-Vue-Next

<br />

# 介绍

@hippy/vue-next 基于 @hippy/vue 的已有逻辑。通过 Vue3.x 提供的 [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154)，无需侵入 Vue 代码直接通过外部库的方式引用 Vue，
可以及时跟随 Vue 生态，在实现原理上与 @hippy/vue 基本一致。

@hippy/vue-next 全部代码采用 typescript 进行编写，可以拥有更好的程序健壮性和类型提示，并且 @hippy/vue-next 在整体架构上也进行了一定程度的优化。

# 架构图

<img src="assets/img/hippy-vue-next-arch-cn.png" alt="hippy-vue-next 架构图" width="80%"/>
<br />
<br />

# 如何使用

@hippy/vue-next 支持的能力与 @hippy/vue 基本一致。因此关于 Hippy-Vue 的组件、模块、样式等就不做额外声明了，可以直接参考 [Hippy-Vue](hippy-vue/introduction)
中的相关内容，本文档仅对差异部分进行说明：

demo 参考：https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo

```javascript
  "@hippy/vue-next": "v2.17-latest",
  "@hippy/vue-router-next-history": "latest",
```

## 初始化

```javascript
// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';

// 创建 Hippy App 实例，需要注意 Vue3.x 使用 Typescript，因此需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name 必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 启动 Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps 是 Native 传入的初始化参数，如果需要做路由预处理等操作，则可以让 Native 将对应参数传入
  // rootViewId 是 Native 当前 Hippy 实例所挂载的 Native 的根节点的 id
  // mount app，完成渲染上屏 
  app.mount('#mount');
})
```

如果要使用 Vue-Router，则需要使用另外的初始化逻辑

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

// 创建 Hippy App 实例，需要注意 Vue3.x 使用 Typescript，因此需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(App, {
  // Hippy App Name，必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 路由列表
const routes = [
  {
    path: '/',
    component: Index,
  },
];

// 创建路由对象
const router: Router = createHippyRouter({
  routes,
});

// 使用路由
app.use(router);

// 启动 Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps 是 Native 传入的初始化参数，如果需要做路由预处理等操作，则可以让 Native 将对应参数传入
  // rootViewId 是 Native 当前 Hippy 实例所挂载的 Native 的跟节点的 id

  // 因为现在使用的是vue-router的memory history，因此需要手动推送初始位置，否则router将无法ready
  // 浏览器上则是由vue-router根据location.href去匹配，默认推送根路径'/'，如果想要实现类似浏览器中默认跳转到指定页面，可以让终端同学将初始化的 path
  // 从 superProps 中传入，然后再通过 path 的值去进行 router.push({ path: 'other path' }) 等操作
  router.push('/');
  
  // mount app，完成渲染上屏 
  app.mount('#mount');
})
```

> @hippy/vue-router-next-history 对 vue-router 的 history 模式做了处理，为 Android 加上了触发物理返回键时优先回退历史记录的逻辑

如果不需要这个逻辑，可以直接使用原生 vue-router 来实现路由：

```javascript
import { createRouter, createMemoryHistory, type Router } from 'vue-router';

// 路由列表
const routes = [
  {
    path: '/',
    component: Index,
  },
]; 

const router: Router = createRouter({
  history: createMemoryHistory(),
  routes,
});
```

# 自定义组件和模块

@hippy/vue-next 中同样提供了 `registerElement` 来注册自定义组件，将 template 中的 tag 和原生组件映射起来，所需要注意的是，@hippy/vue
中 `registerElement` 方法是挂在全局 Vue 中，与 Native 类似，@hippy/vue-next 中 `registerElement` 方法也是单独提供了导出

```javascript
import { registerElement } from '@hippy/vue-next';
```

## 注册自定义组件

```javascript
// custom-tag.ts
import { registerElement } from '@hippy/vue-next'

/**
 * 注册自定义标签
 */
export function registerCustomTag(): void {
  // 终端组件名称
  const nativeComponentName = 'CustomTagView'
  // 标签名称
  const htmlTagName = 'h-custom-tag'
  // 注册终端名为 CustomTagView 的自定义组件，这里终端组件名必须与终端组件一致，这里是将我们写的 h-custom-tag 和终端的 CustomTagView 建立映射
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

// 注册自定义组件
registerCustomTag()

// 创建 Hippy App 实例，需要注意 Vue3.x 使用 Typescript，因此需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name 必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 此后代码省去...

```

## 绑定终端事件返回值

因为 @hippy/vue-next 采用了和浏览器一致的事件模型，又希望能统一双端的事件（有的时候双端事件返回值不一样），所以采取了手动修改事件返回值的方案，需要显式声明每个事件的返回值。
这一步是在注册自定义组件时通过 `processEventData` 方法进行处理的，它有两个参数

- evtData 包含事件处理 handler 和 事件名 __evt
- nativeEventParams 终端的原生事件返回体

例如 @hippy/vue-next 中原生的 [swiper](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-next/src/native-component/swiper.ts) 组件，它是 swiper 实际渲染的对应节点，这里就对事件返回值进行了处理

```javascript
  // register swiper tag
  registerElement('hi-swiper', {
    component: {
      name: 'ViewPager', // 终端的组件名
      processEventData(
        evtData: EventsUnionType,
        nativeEventParams: { [key: string]: NeedToTyped },
      ) {
        // handler 即我们收到的 event 对象，__evt 即使我们收到的终端事件名
        const { handler: event, __evt: nativeEventName } = evtData;
        switch (nativeEventName) {
          case 'onPageSelected':
            // 显式将 native 的事件参数 nativeEventParams 的值赋予 @hippy/vue-next 真正绑定的事件 event
            // 这样我们在 swiper 组件的 pageSelected 中收到的事件参数就包含 currentSlide 了
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

## 使用 Vue 组件实现自定义组件

当你的自定义组件包含了更复杂的交互、事件、声明周期的时候，单纯的 `registerElement` 就不够用了，它只能做到很基本的元素名称到组件的映射，和基本的参数映射。
这时我们可以通过 Vue 注册单独的组件来实现这个复杂的自定义组件，关于 Vue 组件注册可以参考[组件注册](https://cn.vuejs.org/guide/components/registration.html)，注意 Vue3 和
Vue2的组件注册有一些差异
也可以参考 @hippy/vue [swiper](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-next/src/native-component/swiper.ts)组件的实现

### 事件处理

通过 Vue 注册的组件，如果要将终端事件传给组件外层，需要做额外处理，有两种方式

- 使用 `render` 函数（推荐）

```javascript
import { createApp } from 'vue'

const vueApp = createApp({})
// Vue3 中组件注册不再是通过全局 Vue 来实现了，这里注册 swiper 组件
vueApp.component('Swiper', {
  // ... 省去其他代码
  render() {
    /*
     * 可以用 render 函数的方式
     * 'pageScroll'是传输给终端的事件名（传输终端时会被自动转成转成onPageScroll）
     * 'dragging' 是真正暴露给用户使用的事件名
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

// 这里注册终端自定义组件
registerElement('hi-swiper', {
  component: {
    name: 'ViewPager',
  },
});
```


- 使用 Vue `SFC` 方式

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
    // 对事件进行转换，注意 Vue3 中事件也是存放在组件的 $attrs 中了，与其他属性一样，只是事件是以 onXXX 格式存储，在 Vue2 中则是存放在 on 属性中
    // pageSelected 是传输给终端的事件名（传输终端时会被自动转成onPageSelected）
    // dropped 是真正暴露给用户使用的事件名
    if (this.$attrs['onDropped']) {
        // 如果用户注册了 dropped 事件，这个事件在终端对应的是 pageSelected 事件，
        // 将 onDropped 的处理方法赋值给 onPageSelected，这样当终端触发 pageSelected
        // 事件时，用户侧绑定的 onDropped 方法就会被正常回调了
        this.$attrs['onPageSelected'] = this.$attrs['onDropped']
    }
  }
})
</script>

// app.ts
import { registerElement } from '@hippy/vue-next'
import { createApp } from 'vue'
import Swiper from './swiper.vue'

// 注册自定义终端组件
registerElement('hi-swiper', {
  component: {
    name: 'ViewPager',
  },
});

// 创建 vue 实例
const vueApp = createApp({})
// 注册 vue 组件
vueApp.component('Swiper', Swiper)
```

> 使用 `SFC` 方式注册的自定义 tag 会被 Vue 作为组件来处理，但是有没有注册该组件，因此会报错，所以我们需要通过 `isCustomElement` 告诉 Vue 这是我们的
> [自定义组件](https://cn.vuejs.org/api/application.html#app-config-compileroptions-iscustomelement)，直接渲染即可。
> 注意 hippy-webpack.dev.js，hippy-webpack.android.js，hippy-webpack.ios.js 都需要处理，这里第一个是开发环境构建使用，后两个是生产环境构建使用

```javascript
// src/scripts/hippy-webpack.dev.js & src/scripts/hippy-webpack.android.js & src/scripts/hippy-webpack.ios.js 都需要处理

/**
 * 判断给定 tag 是否是自定义组件的 tag，这里根据实际情况处理
 */
function isCustomTag(tag) {
  return tag === 'hi-swiper'
}

// vue loader 部分
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
          // 注册自定义组件
          isCustomElement: tag => isCustomTag(tag)
        },
      },
    },
  ],
}

```

# 服务端渲染

@hippy/vue-next 现已支持服务端渲染，具体代码可以查看[示例项目](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-ssr-demo)中的 SSR
部分，关于 Vue SSR 的实现及原理，可以参考[官方文档](https://cn.vuejs.org/guide/scaling-up/ssr.html)。

## 如何使用SSR

请参考[示例项目](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-ssr-demo)说明文档中的 How To Use SSR

## 实现原理

### SSR 架构图

<img src="assets/img/hippy-vue-next-ssr-arch-cn.png" alt="hippy-vue-next SSR 架构图" width="80%"/>

### 详细说明

@hippy/vue-next SSR 的实现涉及到了编译时，客户端运行时，以及服务端运行时三个运行环境。在 vue-next ssr的基础上，我们开发了 @hippy/vue-next-server-renderer
用于服务端运行时节点的渲染，开发了 @hippy/vue-next-compiler-ssr 用于编译时 vue 模版文件的编译。以及 @hippy/vue-next-style-parser 用于服务端渲染得到的
Native Node List 的样式插入。下面我们通过一个模版的编译和运行时过程来说明 @hippy/vue-next SSR 做了哪些事情

我们有形如`<div id="test" class="test-class"></div>`的一段模版

- 编译时

  模版经过 @hippy/vue-next-compiler-ssr 的处理，得到了形如

  ```javascript
  _push(`{"id":${ssrGetUniqueId()},"index":0,"name":"View","tagName":"div","props":{"class":"test-class","id": "test",},"children":[]},`)
  ```

  的 render function

- 服务端运行时

  在服务端运行时，编译时得到的 render function 执行后得到了对应节点的 json object。注意 render function 中的
  ssrGetUniqueId 方法，是在 @hippy/vue-next-server-renderer 中提供的，在这里 server-renderer 还会对
  节点的属性值等进行处理，最后得到 Native Node 的 json object

  ```javascript
  { "id":1,"index":0,"name":"View","tagName":"div","props":{"class":"test-class","id": "test",},"children":[] }
  ```

  > 对于手写的非 sfc 模版的渲染函数，在 compiler 中无法处理，也是在 server-renderer 中执行的

- 客户端运行时

  在客户端运行时，通过 @hippy/vue-next-style-parser，给服务端返回的节点插入样式，并直接调用 hippy native 提供的
  native API，将返回的 Native Node 对象作为参数传入，并完成节点的渲染上屏。 完成节点上屏之后，再通过系统提供的
  global.dynamicLoad 异步加载客户端异步版 jsBundle，完成客户端 Hydrate 并执行后续流程。

## 初始化差异

SSR 版本的 Demo 初始化与异步版的初始化有一些差异部分，这里对其中的差异部分做一个详细的说明

- src/main-native.ts 变更

1. 使用 createSSRApp 替换之前的 createApp，createApp 仅支持 CSR 渲染，而 createSSRApp 同时支持 CSR 和 SSR
2. 在初始化时候新增了 ssrNodeList 参数，作为 Hydrate 的初始化节点列表。这里我们服务端返回的初始化节点列表保存在了 global.hippySSRNodes 中，并将其作为参数在createSSRApp时传入
3. 将 app.mount 放到 router.isReady 完成后调用，因为如果不等待路由完成，会与服务端渲染的节点有所不同，导致 Hydrate 时报错

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

- src/main-server.ts 新增

main-server.ts 是在服务端运行的业务 jsBundle，因此不需要做代码分割。整体构建为一个 bundle 即可。其核心功能就是在服务端完成首屏渲染逻辑，并将得到的首屏 Hippy 节点进行处理，插入节点属性和 store（如果存在）后返回，
以及返回当前已生成节点的最大 uniqueId 供客户端后续使用。

>注意，服务端代码是同步执行的，如果有数据请求走了异步方式，可能会出现还没有拿到数据，请求就已经返回了的情况。对于这个问题，Vue SSR 提供了专用 API 来处理这个问题:
>[onServerPrefetch](https://cn.vuejs.org/api/composition-api-lifecycle.html#onserverprefetch)。
>在 [Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-ssr-demo/src/app.vue) 的 app.vue 中也有 onServerPrefetch 的使用示例

- server.ts 新增

server.ts 是服务端执行的入口文件，其作用是提供 Web Server，接收客户端的 SSR CGI 请求，并将结果作为响应数据返回给客户端，包括了渲染节点列表，store，以及全局的样式列表。

- src/main-client.ts 新增

main-client.ts 是客户端执行的入口文件，与之前纯客户端渲染不同，SSR的客户端入口文件仅包含了获取首屏节点请求、插入首屏节点样式、以及将节点插入终端完成渲染的相关逻辑。

- src/ssr-node-ops.ts 新增

ssr-node-ops.ts 封装了不依赖 @hippy/vue-next 运行时的 SSR 节点的插入，更新，删除等操作逻辑

- src/webpack-plugin.ts 新增

webpack-plugin.ts 封装了 SSR 渲染所需 Hippy App 的初始化逻辑


# 其他差异说明

目前 `@hippy/vue-next` 与 `@hippy/vue` 功能上基本对齐，不过在 API 方面与 @hippy/vue 有一些区别，以及还有一些问题还没有解决，这里做些说明：

- Vue.Native

  在 @hippy/vue 中，Native 提供的能力是通过挂载在全局 Vue 对象的 Native 属性来提供的，在 Vue3.x 中这种实现方式不再可行，因此现在 Native 属性需通过 @hippy/vue-next 导出来使用

  ```javascript
  import { Native } from '@hippy/vue-next';
  
  console.log('do somethig', Native.xxx)
  ```

- 全局事件

  在 @hippy/vue 中，全局事件是挂载在 Vue 上的，在 @hippy/vue-next 中，提供了单独的 `EventBus` 事件总线来处理该问题

  ```javascript
  import { EventBus } from '@hippy/vue-next';
  
  // 监听容器大小改变事件
  EventBus.$on('onSizeChanged', ({ oldWidth, oldHeight, width, height }) => {
    // oldWidth: 旧的宽度；oldHeight: 旧的高度；width: 新的宽度; height: 新的高度
    console.log('size', oldWidth, oldHeight, width, height);
  });
  // 触发全局事件
  EventBus.$emit('eventName', {
    ...args, // 事件参数
  });
  ```

- v-model 指令

  因为 Vue3.x 中内置指令的实现采用的是编译时插入代码的方式，目前 v-model 指令还没有找到很好的办法去处理，这里可以先使用临时解决办法实现对应功能

  ```javascript
  // 具体的可以参考 demo 中的 demo-input.vue 中的示例
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

- Keep-Alive HMR 问题

  在示例代码中，我们的路由组件是包裹在 Keep-Alive 组件内的，但是目前使用 Keep-Alive 包裹的路由组件无法实现开发时热更新，需要刷新整个实例才能完成刷新。
  如果是不包裹在 Keep-Alive 中则没有这个问题。目前官方[该问题](https://github.com/vuejs/core/pull/5165)也尚未解决，等待官方解决后升级 Vue 即可解决该问题。

  !> vue@3.2.45+ 已经修复了该[问题](https://github.com/vuejs/core/pull/7049)，使用3.2.45及以上版本进行开发时，keep-alive内的组件也可以热更新了

- Vue3.x 变量 Proxy 问题

  因为 3.x 的响应式是通过 Proxy 代理对象来实现的，所以我们得到的对象其实是 Proxy 的实例而非原始对象，因此调用终端接口时需要注意，终端并不认识 Proxy 对象，需要使用 Vue 提供的 [`toRaw`](https://cn.vuejs.org/api/reactivity-advanced.html#toraw) 方法来拿到原始的对象并传递给终端接口。

- Native 接口和自定义组件的类型提示

  @hippy/vue-next 提供了 Native 模块接口的 Typescript 类型提示，如果有业务自定义的 Native 接口，也可以采用类似的方式进行扩展

    ```javascript
    declare module '@hippy/vue-next' {
      export interface NativeInterfaceMap {
        // 用户自定义的 Native 接口，接下来你可以在调用 Native.callNative，Native.callNativeWithPromise 时拥有类型提示了
      }
    }
    ```

  @hippy/vue-next 也参考 `lib.dom.d.ts` 的事件声明提供了事件类型，具体可以参考 hippy-event.ts 文件。如果需要在内置的事件上进行扩展，可以采用类似方式

    ```javascript
      declare module '@hippy/vue-next' {
        export interface HippyEvent {
          testProp: number;
        }
      }
    ```

  在使用 `registerElement` 去注册组件的时候，利用了 typescript 的 `type narrowing`，在 switch case 中提供了准确的类型提示。如果在业务注册自定义组件的时候也需要类型提示，可以采用如下方式:

    ```javascript
      export interface HippyGlobalEventHandlersEventMap {
        // extend new event name and related event interface
        onTest: CustomEvent;
        // extend existing event interface
        onAnotherTest: HippyEvent;
      }
    ```

  更多信息可以参考 demo 里的 [extend.ts](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/src/extend.ts).

- whitespace 处理

  Vue2.x Vue-Loader `compilerOptions.whitespace` 默认值为 `preserve`， Vue3.x 默认值为 `condense`（可参考 [Vue3 whitespace说明](https://cn.vuejs.org/api/application.html#app-config-compileroptions-whitespace)）。

  关闭 `trim` 能力的配置方式也有所不同，改在了 `createApp` 的参数中进行设置。

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

- dialog 差异

  `<dialog>` 组件的第一个子元素不能设置  `{ position: absolute }` 样式，如果想将 `<dialog>` 内容铺满全屏，可以给第一个子元素设置 `{ flex: 1 }` 样式或者显式设置 width 和 height 数值。这与 Hippy3.0 的逻辑保持一致。

# 示例

更多使用请参考 [示例项目](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo).
