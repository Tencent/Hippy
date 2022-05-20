# Hippy Vue Native Components

> The package contains the **Native only** components provide by Hippy.
> For web alternative could use `hippy-vue-web-components`(it's not exist yet).

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## How to use

### Install

Install with tnpm.

```bash
tnpm install hippy-vue-native-components
```

### Register components with the middleware

#### 1. Register all of components

Point to the native entry, import the middleware

```javascript
import HippyVueNativeComponents from 'hippy-vue-native-components';
```

And use the middleware

```javascript
Vue.use(HippyVueNativeComponents);
```

#### 2. Register specific component

Dialog component as the example, point to the native entry, import the specific middleware.
for more reigster, see the `Register Middleware` column in `Supported native components` table.

```javascript
import { ModalComponent } from 'hippy-vue-native-components';
```

And use the middleware

```javascript
Vue.use(ModalComponent);
```

### Template usage

#### Dialog component as the example

```javascript
<template>
  <dialog
    animationType="slide"
    class="dialog-demo"
    :supportedOrientations="supportedOrientations"
    v-if="dialogIsVisible"
    @show="onShow"
    @requestClose="onClose">
    <div class="dialog-demo-wrapper">
      <div class="fullscreen center row">
        <button @click="clickView" class="dialog-demo-close-btn center row">
          <p class="dialog-demo-close-btn-text">Close</p>
        </button>
      </div>
    </div>
  </dialog>
</template>
```

## Supported native components

| ComponentName      | Native component mapping | Register Middleware   | Description                   |
| ------------------ | ------------------------ | --------------------- | ----------------------------- |
| anmiation          | Animation/AnimationSet   | AnimationComponent    | Animation component           |
| dialog             | Modal                    | ModalComponent        | Native modal                  |
| ul-refresh-wrapper | RefreshWrapperView       | ListRefreshComponent  | Wrap the ul to pull refresh   |
| ul-refresh         | RefreshWrapperItemView   | ListRefreshComponent  | Contents in pull down area    |
| swiper             | ViewPager                | SwiperComponent       | Slider                        |
| swiper-slide       | ViewPagerItem            | SwiperComponent       | Slider Page                   |
| waterfall          | WaterfallView            | WaterfallComponent    | Waterfall                     |
| waterfall-item     | WaterfallViewItem        | WaterfallComponent    | Waterfall Item                |
