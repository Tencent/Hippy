# 自定义组件和模块

# Vue.registerElement

hippy-vue 提供了 `registerElement` 方法来注册组件，将 template 中的 tag 和原生组件映射起来。

## 示例

```javascript
import Vue from 'vue';

/*
 * 直接注册一个 ComponentName 到终端组件，这里推荐单词首字母大写的拼写。
 * template 里可以直接用 <ComponentName />
 * ComponentName 必须跟终端组件名称一致，且不能包含 Hippy 字符。
 */
Vue.registerElement('MyView');

/*
 * 也可以注册一个小写的 tagname，然后通过参数映射到 ComponentName 终端组件
 * 但是 tagname 忽略大小写后也不能和 ComponentName 相同。(如 tag name 命名为 my-view, component name 不能命名为 MyView)
 * template 里可以直接用 <tagname />，同样会映射 ComponentName 组件上。
 * ComponentName 必须跟终端组件名称一致，不能包含 Hippy 字符。
 */
Vue.registerElement('h-my-view', {
  component: {
    name: 'MyView',
  },
});
```

## 绑定终端事件返回值

因为 hippy-vue 采用了和浏览器一致的事件模型，又希望能统一双端的事件（有的时候双端事件返回值不一样），所以采取了手动修改事件返回值的方案，需要显式声明每个事件的返回值。

这一步是在注册组件时通过 `processEventData` 方法进行处理的，它有三个参数：

* event: 终端回调函数里接收到的事件实例，需要对它进行修改
* nativeEventName: 终端的原生事件名称
* nativeEventParams：终端的原生事件返回体

例如，hippy-vue 的 [hi-swiper 组件](//github.com/Tencent/Hippy/blob/master/framework/js/packages/hippy-vue-native-components/src/swiper.js#L4)，它是 swiper 实际渲染的对应节点。

```javascript
component: {
  name: 'ViewPager',
  processEventData(event, nativeEventName, nativeEventParams) {
    switch (nativeEventName) {
    case 'onPageSelected':
      // 显式将 native 的事件参数 nativeEventParams 的值赋予 hippy-vue 真正绑定的事件 event
      event.currentSlide = nativeEventParams.position;
      break;
    case 'onPageScroll':
      event.nextSlide = nativeEventParams.position;
      event.offset = nativeEventParams.offset;
      break;
    default:
      break;
    }
    return event;
  }
}
```

# Vue.component

当你需要处理更加复杂的交互、事件、生命周期的时候，需要通过 `Vue.component` 注册一个单独的组件，registerElement 只能做到很基本的元素名称到组件的映射，和基本的参数映射。

详情参考：//cn.vuejs.org/v2/guide/components-registration.html

## 事件处理

通过 `Vue.component` 自定义的组件，若需要将终端事件传给组件外层，需要做额外处理，有两种方式：

* 使用 `render` 函数（推荐）

```javascript
  Vue.component('Swiper', {
    /*
     * 可以用 render 函数的方式
     * 'pageScroll'是传输给终端的事件名（传输终端时会被自动转成转成onPageScroll）
     * 'dragging' 是真正暴露给用户使用的事件名
     */
    render(h) {
        const on = {
            pageSelected: evt => this.$emit('dropped', evt),
            pageScroll: evt => this.$emit('dragging', evt),
            pageScrollStateChanged: evt => this.$emit('stateChanged', evt),
        };
        return h('hi-swiper', {
            on,
            ref: 'swiper',
            attrs: {
                initialPage: this.$initialSlide,
            },
        }, this.$slots.default);
    },
});
```

* 使用 `template`

```javascript
  Vue.component('Swiper', {
    /*
     * 可以用 template 的方式，HippyVue会在运行时将其转换成 render 函数
     * 'pageScroll'是传输给终端的事件名（传输终端时会被自动转成onPageScroll）
     * 'dragging' 是真正暴露给用户使用的事件名
     */
    template: `
      <hi-swiper
          :initialPage="$initialSlide"
          ref="swiper"
          @pageScroll="$emit('dragging', $event)"
          @pageScrollStateChanged="$emit('stateChanged', $event)"
          @pageSelected="$emit('dropped', $event)"
      >
      <slot />
      </hi-swiper>`,
});
```

# 自定义模块

> 该范例仅可以在 Android 下运行。

hippy-vue 的模块其实只是一个 `Vue.Native.callNative` 调用，写个 `function` 即可。

```js
import Vue from 'vue';

function log(msg) {
  Vue.Native.callNative("TestModule", "log", msg)
}

function helloNative(msg) {
  Vue.Native.callNative("TestModule", "helloNative", msg)
}

// 这个是需要终端回调的
function helloNativeWithPromise(msg) {
  return Vue.Native.callNativeWithPromise("TestModule", "helloNativeWithPromise", msg);
}
```
