# JSI 模式

> 最低支持版本 2.11.0

JavaScript Interface(JSI) 模式提供了一种无需经历编解码（序列化）过程的跨 VM （同步）互调用解决方案，使得 js 可以和 native 直接通信。传统互调用所传递的对象会全部序列化，但并非所有成员都被访问，在特定场景下导致了不必要的开销与冗余。通过 JSI，js 侧可以获取 C++ 定义的对象（HostObject)，并调用该对象上的方法。

## 架构图

<br />
<img src="//m4.publicimg.browser.qq.com/publicimg/nav/hippydoc/jsi_structure.png" alt="jsi架构图" width="40%"/>
<br />
<br />

## 不适用场景

JSI 并非适用于所有场景:

* 所需读取的成员占比越少，JSI 表现出的性能越优异。
* 随着所需读取的成员占比上升，JNI 调用次数的增加，所累计的耗时也随之上涨，反而不如编解码实现性能优异。
* 同步调用简化了编码，耗时更稳定，但会阻塞 JS 执行，不适用于复杂逻辑。

## 使用例子

[HippyReact Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/Turbo/index.jsx)

[HippyVue Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-turbo.vue)
