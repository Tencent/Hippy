# 常见反馈

## 1. Hippy提供了@hippy/react-web和Web Renderer两套方案，哪一套方案转web的能力更完整一些呢？Hippy后续会重点支持哪一个方向？

两套方案都有一些业务在用,  组件和属性支持可以参考这两个文档

https://iwiki.woa.com/p/1478044741

https://iwiki.woa.com/p/1410007954

Hippy 会继续维护 Web Renderer，基于 Web Render，更容易对接 kbone 等来扩展小程序

## 2. Hippy 如何支持小程序

可以Hippy 对接 Kbone、taro、uniapp 等框架，腾讯内部业务可参考其他[业务方案](https://doc.weixin.qq.com/doc/w3_ANsAsgZ1ACcxxR1G3KPR0K85XYnmP?scode=AJEAIQdfAAoD1a4bp0ANsAsgZ1ACc)：

## 3. Hippy 的组件库有推荐吗

[开源仓库](https://github.com/hippy-contrib)

[腾讯内部仓库](https://raftx.woa.com/hippy)

## 4. Hippy 如何做曝光上报

目前 Hippy 还没有对外的曝光上报方案，腾讯内部的业务，可以使用大同来做曝光上报

### 方案

hippy本质上使用的还是客户端原生组件 以及一部分自绘组件。客户端已集成的的大同sdk能够对原生组件、Activity等做检测上报，自然也可以对hippy的组件做检测上报。重点处理上报id绑定到组件的逻辑就可以。

### 接入指引

[Hippy Android 曝光上报指引](https://iwiki.woa.com/p/956352478)

[Hippy iOS 曝光上报指引](https://iwiki.woa.com/p/589637144)

腾讯内部有疑问可以咨询企业微信 端框架小助手


## 5. 启动时, Hippy 如何从终端获取参数

React 通过根节点的 props 获取启动参数

Vue 通过 Vue.$start 回调获取启动参数

## 6. Hippy 页面支持 width: auto 吗

不支持的，可以用imageloader加载读图片尺寸，https://hippyjs.org/#/hippy-vue/vue-native?id=imageloader

## 7. Hippy 背景透明是否支持毛玻璃效果呢

腾讯业务可参考[社区组件](https://raftx.woa.com/hippy/detail/578)

## 8. Hippy 如何实现暗黑模式

有两种方案：

方案一：设置2套css属性，然后切换时整体切换，性能较差

方案二：初始化节点时，把两套属性都带下去，然后终端渲染时切换

## 9. Hippy 有提供类似 IntersectionObserver 方法吗

react 还不支持，vue有封装了一个，可以参考封装下 [hippy-vue-intersection-observer](https://www.npmjs.com/package/hippy-vue-intersection-observer) 不过这个库是基于hippy的Measure API实现的，对bridge通信性能会有一定性能影响，使用时注意评估下

## 10. Hippy 有 Clipboard 的复制剪切功能吗

剪切板相关的能力应该是在3.2移出的，其他版本可以参考文档：https://github.com/Tencent/Hippy/blob/v2.15.x/docs/hippy-react/modules.md#clipboard

## 11. 我们现在前端用的是React技术栈，我们想一部分业务用Vue，一部分业务用React，Hippy支持这种用法吗

支持的，但是react 和 vue得是不同的hippy引擎实例

## 12. Hippy 如何判断横屏

进入app后，横屏切换会触发 onSizeChanged 事件

进入app前已经横屏，这个可以读 Vue.Native.Dimensions ,获取当前窗口长宽来计算，可以参考这个帖子 https://mk.woa.com/q/293192?ADTAG=search

## 13. Hippy 图片必须要设定宽高吗？希望宽度和父级view一样，高度自适应怎么写呢

可以用 ImageLoaderModule.getSize 这个接口先获取图片大小 https://hippyjs.org/#/hippy-react/modules?id=imageloadermodule

## 14. 执行报错 startBatch is not a function, 可能是什么原因

startBatch是 Hippy2 才有的版本，如果前端使用 Hippy2 终端使用 Hippy3 会不兼容，检查下@hippy/hippy-vue 的版本，确保和终端版本一致

## 15. Hippy 是否支持动态加载

支持，参考 https://doc.openhippy.com/#/feature/feature2.0/dynamic-import


