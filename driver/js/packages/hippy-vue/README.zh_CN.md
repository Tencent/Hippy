# Hippy Vue

> 使用基于 Web 的 Vue 技术来开发 Hippy 跨端应用。

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## 特性

* 完全的 Vue 兼容，所有 directive 控制语句都可以使用，甚至包含 Vue-Router，理论上 Vue 的界面组件也可以用。
* 完全兼容网页开发模式，所有组件都跟网页一样，项目可以同时编译出网页、iOS、Android 三份版本。
* 很高的产品质量。
* 默认使用 Flex 布局。

## 使用方法

替换 Vue 的运行时为 `hippy-vue` 即可，其它的一概不变，但是如果要用到 Vue.Native 获取原生参数的话，那最好是给 webpack 做个 alias，hippy-vue 的打包工具已经整合该功能了。

```javascript
// import Vue from 'vue';
import Vue from '@hippy/vue'; // 只需要把 Vue 的运行时库替换为 Hippy Vue，其它的一概不变。
```

## 限制

因为浏览器和终端的实现有所不同，部分特性无法实现（Javascript 也无法 hack），这就需要开发者进行额外的适配。

1. CSS 的比例尺寸

所有百分比单位、相对的 vh、vw、em、rem 等的相对尺寸都无法支持，我们推荐使用 flex 来使双端样式保持统一。

2. CSS 的背景图 background-image 和 background 中的图片参数

在原生终端程序中，图片本身是一个独立的组件，而 hippy-vue 无法做到通过一个 tag 和一个样式生成两个组件，只能通过一个跟目标组件相同 Layout 相同的图片组件来实现。

3. style 中的 CSS 选择器写法

因为 Native 中没有现成的 CSS 选择器，hippy-vue 的 style 样式是一个简单实现的选择，无法进行过于复杂的条件查询，但已经准备好了框架未来会逐个实现。

## 待办事宜

  很多，很多。。。

    1. ~~将 CSS 中的 px 单位尺寸转换为终端使用的 pt~~ - 已经在2018年8月1日实现。
    2. ~~textarea 内容作为 value 的实现，目前文本输入框的内容在终端的 TextInput 组件中是个 props。~~ - 已经在2018年8月6日实现。
    3. ~~v-if/v-show 支持，需要终端底层首先实现 display 的样式支持。~~ - 已经在2018年8月28日实现
    4. ~~v-model 支持，因为它是 Vue 的内部实现，需要进行 TextInput 的 onTextChange 事件的 hack。~~ - 已经在2018年8月22日实现。
    5. ~~transition 支持.~~ - 不算完成，通过 animation 组件代替，完成于2018年11月15日的 1.1.9 版本。
    6. 联合 CSS 选择器的事件绑定支持，例如这样的样式 `.class-name:hover`，CSS 的 hover 需要拆开单独在 JS 层绑定一个 pressIn 事件。
    7. 指定平台的 CSS 样式实现。
    8. 表单元素和事件的支持。
    9. ~~vue-router 整合~~ - 已经在2018年8月31日实现。
    10. css-loader 中对 CSS 参数一 Key 多值的联合写法进行拆解。
