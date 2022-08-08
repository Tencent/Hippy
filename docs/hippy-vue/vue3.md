# Hippy-Vue-Next

<br />

# 介绍

@hippy/vue-next 基于 @hippy/vue 的已有逻辑。通过 Vue 3.x 提供的[createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154)，无需侵入 Vue 代码，直接通过外部库的方式引用 Vue。
可以及时跟随 Vue 生态。在实现原理上与 @hippy/vue 基本一致。将 Vue 组件生成的 VNode Tree 转换为 Hippy Node Tree，并通过 Hippy 终端注入的 Native 渲染接口完成渲染。
@hippy/vue-next 全部代码采用 typescript 进行编写，可以拥有更好的程序健壮性和类型提示。并且 @hippy/vue-next 的整体架构也进行了一定程度的优化

# 架构图

<img src="assets/img/hippy-vue-next-arch-cn.png" alt="hippy-vue-next 架构图" width="80%"/>
<br />
<br />

# 如何使用

@hippy/vue-next 支持的能力与 @hippy/vue 基本一致。因此关于 Hippy-Vue 的组件、模块、样式等就不做额外声明了，可以直接参考 [Hippy-Vue](https://hippyjs.org/#/hippy-vue/introduction)
中的相关内容，本文档仅对差异部分进行说明

- 初始化

```typescript
// 仅 Vue
// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';

// 创建 Hippy App 实例，需要注意 Vue 3.x 使用 Typescript 需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name，必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 启动 Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps 是 Native 传入的初始化参数，如果需要做路由预处理等操作，则可以让 Native 将对应参数传入
  // rootViewId 是 Native 当前 Hippy 实例所挂载的 Native 的跟节点的 id
  // mount app，完成渲染上屏 
  app.mount('#mount');
})
```

如果要使用 Vue-Router，则需要使用另外的初始化逻辑

```typescript
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
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import App from 'app.vue';

// 创建 Hippy App 实例，需要注意 Vue 3.x 使用 Typescript 需要使用 defineComponent 将组件对象进行包裹
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
const router: Router = createRouter({
  history: createMemoryHistory(),
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

# 示例

[示例项目](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo)与 @hippy/vue 示例项目实现的功能基本一致，只是写法上采用的是 Vue 3.x 的组合式 API 的写法，以及部分 @hippy/vue-next 与 @hippy/vue 不同的写法。
具体的请直接看示例项目的写法

# 额外说明

目前 @hippy/vue-next 与 @hippy/vue 功能上基本对齐了，不过包本身还有些问题没有解决，这里做下说明，我们会尽快修复问题

- v-model指令：
  因为 Vue 3.x 中内置指令的实现采用的是编译时插入代码的方式，目前v-model指令还没有找到很好的办法去处理，这里可以先使用临时解决办法实现对应功能

  ```typescript
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

- Keep-Alive HMR问题：在示例代码中，我们的路由组件是包裹在 Keep-Alive 组件内的，但是目前使用 Keep-Alive 包裹的路由组件无法实现开发时热更新，需要刷新整个实例才能完成刷新。
  如果是不包裹在 Keep-Alive 中则没有这个问题。目前官方[该问题](https://github.com/vuejs/core/pull/5165)也尚未解决。等待官方解决后升级 Vue 即可解决该问题
- 其他尚未发现的Bug...
