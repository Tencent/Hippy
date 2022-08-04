 # @hippy/vue-next

### Introduction

This package implements the logic of core runtime based on the custom renderer `createRenderer` provided by vue3, so no intrusive modifications are made to vue3 framework. Moreover, the whole project is implemented based on TypeScript. Through the type system of TypeScript, code can be better constrained and development quality can be improved.

### Usage

```javascript
import { defineComponent } from 'vue';
import { createApp } from '@hippy/vue-next';

const app = createApp(defineComponent({
  data() {
    return {
      counter: 0,
    }
  }
}), {
  appName: 'Demo',
});
```

