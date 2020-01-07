# Hippy 概述

Hippy 可以理解为一个精简版的浏览器，从底层做了大量工作，抹平了 iOS 和 Android 双端差异，提供了接近 Web 的开发体验，目前上层支持了 React 和 Vue 两套界面框架，前端开发人员可以通过它，将前端代码转换为终端的原生指令，进行原生终端 App 的开发。

同时，Hippy 从底层进行了大量优化，在启动速度、可复用列表组件、渲染效率、动画速度、网络通信等等都提供了业内顶尖的性能表现。

## 交流链接

* [文章专栏](https://cloud.tencent.com/developer/column/84006)
* QQ 群：[784894901](//shang.qq.com/wpa/qunwpa?idkey=7bff52aca3aac75a4f1ba96c1844a5e3b62000351890182eb60311542d75fa1a) - 点击链接启动 QQ 加入，或者复制群号码手工加入。
* QQ群二维码，使用手机QQ扫描加入

![QQ群二维码](https://puui.qpic.cn/vupload/0/1578363513271_py0yktxq7x.png/0)

## 功能对比

Hippy 从底层增加了很多和浏览器相同的接口，方便了开发者使用，这里有几个 Hippy 的独有功能。

| 分类 | 特性                     |  说明 | 支持情况 |
| ---- | ----------------------- | ----- | -------- |
| 接口 | fetch                    | Http/Https 协议请求 | ✅ 支持   |
|      | WebSocket               | 基于 Http 协议的即时通讯 |✅ 支持|
| 事件  | onClick                 | 点击事件 |✅ 支持|
|      | onTouchStart/onTouchDown | 触屏开始事件 |✅ 支持|
|      | onTouchMove             | 触屏移动事件 |✅ 支持|
|      | onTouchEnd              | 触屏结束事件 |✅ 支持|
|      | onTouchCancel           | 触屏取消事件 |✅ 支持|
| 样式 | zIndex                   | 界面层级 |✅ 支持|
|      | backgroundImage         | 背景图片 |✅ 支持|


## 包体积

Hippy 的包体积在业内也是非常具有竞争力的。

![包体积1](//res.imtt.qq.com/hippydoc/img/out/baodaxiao.png)

上图是一个空的APK，在引入后终端包大小对比。

![包体积2](//res.imtt.qq.com/hippydoc/img/out/jsbao.png)

上图是在前端搭建了一个最简单的 ListView 后，前端打出的 JS 的包大小对比。

## 渲染性能

ListView 在滑动时的性能对比，Hippy 可以一直保持十分流畅的状态

![渲染性能](//res.imtt.qq.com/hippydoc/img/out/listxingneng.png)

## 内存占用

而在内存占用上，初始化 List 时 Hippy 就略占优势，在滑动了几屏后内存开销的差距越来越大。

![内存占用](//res.imtt.qq.com/hippydoc/img/out/listmeicun.png)

## 跟 Web 接近的开发体验

Hippy 在开发体验上也进行了大量优化，包含但不限于，跟浏览器一样的 onClick、onTouch 系列触屏事件，更加简单的动画方案，hippy-vue 提供了和 Vue 的完全兼容等等。

## 总结

如果您准备好了，那就 [开始接入 Hippy](guide/integration.md) 吧。
