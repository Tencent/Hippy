# 手势系统

Hippy 的手势系统使用起来相对更加便捷，主要区别就在不需要再依赖其它事件组件，所有组件，包括 div、p 、label、img 或各种自定义控件等都可以设置点击、触屏事件监听；

---

# 点击事件

点击事件包括长按、点击、按下、抬手 4 种类型，分别由以下 4 种接口通知：

1. click：当控件被点击时，会回调此函数；
2. longClick：当控件被长按时，此函数会被调用；

# 触屏事件

触屏事件的处理与点击事件类似，可以在任何 Vue 组件上使用，touch 事件主要由以下几个回调函数组成：

1. touchstart(event)：当用户开始在控件上按下手指时，将回调此函数，并将触屏点信息作为参数传递进来；
2. touchmove(event)：当用户在控件移动手指时，此函数会持续收到回调，并通过 event 参数告知控件的触屏点信息；
3. touchend(event)：当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event 参数也会通知当前的触屏点信息；
4. touchcancel(event)：当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为 hidden）、其他组件的滑动手势，此函数会收到回调，触屏点信息也会通过 event 参数告知前端； `注意：若 touchcancel 被触发，则 touchend 不会被触发`


手势回调参数与 Web 的 `Event` 实例参数接近，包含了 `type`，`target`，`currentTarget` ，`具体事件参数`等。

> 2.16.0 版本开始 `Event` 实例增加 `nativeParmas` 参数，可直接透传终端的所有事件属性

# 事件冒泡

[[事件冒泡范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

点击事件和触屏事件均可以在回调函数中定义是否需要冒泡该事件到上层组件，点击或触屏事件发生时，终端会寻找该触屏点下声明了要处理该事件的最小控件：

HippyVue 手势事件默认冒泡，可以通过 `stopPropagation` 方法或者 `stop` 修饰符阻止

# 事件捕获

Vue 暂不支持事件捕获

# 事件拦截

某些场景下，父控件需要优先拦截到子控件的手势事件，因此 Hippy 也提供了手势事件拦截机制，手势拦截由父控件的两个属性控制 `onInterceptTouchEvent` 和`onInterceptPullUpEvent`
，这两个属性仅对能容纳子控件的组件生效，如 `<img />` 这种控件就不支持这两个属性：

- onInterceptTouchEvent：父控件是否拦截所有子控件的手势事件，true 为拦截，false 为不拦截（默认为 false）。当父控件设置该属性为 true 时，所有其子控件将无法收到任何 touch
  事件和点击事件的回调，不管是否有设置事件处理函数，在该父控件区域内按下、移动、抬起手指以及点击和长按发生时，终端将默认把事件发送给该父控件进行处理。如果父控件在设置 onInterceptTouchEvent 为 true
  之前，子控件已经在处理 touch 事件，那么子控件将收到一次 touchcancel 回调（如果子控件有注册该函数）；
- onInterceptPullUpEvent：该属性的作用与 onInterceptTouchEvent 类似，只是决定父控件是否拦截的条件稍有不同。为 true
  时，如果用户在当前父控件区域内发生了手指上滑的动作，后续所有的触屏事件将被该父控件拦截处理，所有其子控件将无法收到任何 touch 事件回调，不管是否有设置 touch 事件处理函数；如果拦截生效之前子控件已经在处理 touch 事件，子控件将收到一次 touchcancel 回调。为 false 时，父控件将不会拦截事件，默认为 false；

注意，由于这两种标记拦截条件不同，onInterceptTouchEvent 标记设置为 true 之后，子控件的所有触屏事件都将失效，而 onInterceptPullUpEvent 则不会影响子控件的点击事件。

还是以代码为例：

```vue
<template>
  <div>
    <div :onInterceptTouchEvent="true">
      <div />
    </div>
  </div>
</template>
```
