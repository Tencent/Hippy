 # @hippy/vue-next

### Introduction

This package implements the logic of core runtime based on the custom renderer `createRenderer` provided by vue3, so no intrusive modifications are made to vue3 framework. Moreover, the whole project is implemented based on TypeScript. Through the type system of TypeScript, code can be better constrained and development quality can be improved.

### Usage

```typescript
// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';

// create hippy app instance
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  appName: 'Demo',
});

// start hippy app
app.$start().then(({ superProps, rootViewId }) => {
  // mount hippy app and render to native 
  app.mount('#mount');
})
```
> This is the simple usage. For more detail, please read the [doc](https://hippyjs.org) or
> try [demo](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo).
> 

