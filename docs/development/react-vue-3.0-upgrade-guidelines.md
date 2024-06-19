# Hippy React&Vue 3.x SDK升级指引

> 这篇教程，主要介绍 Hippy React&Vue&Vue-next 如何升级3.0版本以及升级后的相关验证关注点。

---

# 升级依赖项变更

## hippy-react

>如果业务目前使用 React 来开发 Hippy，可以参考当前章节升级指引。
</br>

如果当前 @hippy/react 版本小于 2.12.0, 且 React 使用的 16 的版本，则需要升级如下版本：

``` javascript
（1）删除 react-reconciler 依赖
（2）@hippy/react 升级到 3.2.0-beta 及以上
（3）新增 @hippy/react-reconciler 依赖，使用react17的tag，即 @hippy/react-reconciler: "react17"
（4）React 版本升级到 17，即 react: "^17.0.2"
（5）如果使用了 @hippy/react-web 包做h5同构，则需要升级 @hippy/react-web 到 3.2.0-beta 及以上
```

如果当前 @hippy/react 版本大于 2.12.0, 且 React 使用的 17 的版本，则需要升级如下版本：

``` javascript
（1）@hippy/react 升级到 3.2.0-beta 及以上
（2）升级 @hippy/react-reconciler 依赖，使用react17的tag，即 @hippy/react-reconciler: "react17"
（3）如果使用了 @hippy/react-web 包做h5同构，则需要升级 @hippy/react-web 到 3.2.0-beta 及以上
```

需要业务使用新的 hippy-react 重编 js common包

## hippy-vue

>如果业务目前使用 Vue 2.x 来开发 Hippy，可以参考当前章节升级指引。
</br>

需要升级如下版本依赖：

``` javascript
（1）@hippy/vue 升级到 3.2.0-beta 及以上
（2）@hippy/vue-native-components 升级到 3.2.0-beta 及以上
（3）@hippy/vue-router 升级到 3.2.0-beta 及以上
（4）@hippy/vue-css-loader 升级到 3.2.0-beta 及以上
（5）@hippy/vue-loader 升级到 3.2.0-beta 及以上
（6）vue 和 vue-router 等vue相关依赖无需升级
```

需要业务使用新的 hippy-vue 重编 js common包

## hippy-vue-next

>如果业务目前使用 Vue 3.x 来开发 Hippy，可以参考当前章节升级指引。
</br>

需要升级如下版本依赖：

``` javascript
（1）@hippy/vue-next 升级到 3.2.0-beta.1 及以上
（2）@hippy/vue-css-loader 升级到 3.2.0-beta 及以上
（3）@hippy/vue-router-next-history 升级到 0.0.1
（4）vue 和 vue-router 等vue相关依赖无需升级
```

需要业务使用新的 hippy-vue-next 重编 js common包

</br>
</br>

# 接入与使用方式变更

接入 Hippy-React、Hippy-Vue、Hippy-Vue-Next SDK 代码无变化，可参考 [前端集成指引](development/react-vue-3.0-integration-guidelines.md)

具体变化点如下：

1. iOS 新增节点层级优化算法，Android 优化了现有的层级优化算法：
该算法会将仅参与布局的View节点优化去除，从而提升渲染效率。请注意 ！！！由于该算法的存在，可能导致依赖特定UI层级结构的native组件发生找不到特定View的异常。
此时，可以通过前端代码中给特定 View 增加 collapsable: 'false' 属性来禁止该节点被优化算法去除。


# 组件变更

1. dialog 组件的第一个子元素不能设置  { position: absolute } 样式，如果想将 dialog 内容铺满全屏，可以给第一个子元素设置 { flex: 1 } 样式或者显式设置 width 和 height 数值

2. Image 组件废弃了 source、 sources、srcs 字段，建议使用 src 字段代表图片 url

3. iOS Image 组件默认没有实现图片缓存 （由于实现机制的变化），需要业务 iOS端自行实现缓存管理，详细可参考 [iOS 升级指引](development/ios-3.0-upgrade-guidelines.md)

# 接口定义变更

1. hippy-react 不再导出RNfqb、RNfqbRegister、RNfqbEventEmitter、RNfqbEventListener 方法

2. hippy-react animation 模块不再有 destory() 方法的错误写法兼容，统一用 destroy()

3. hippy-react animation 事件监听不再支持 onRNfqbAnimationXX  兼容写法，统一用 onHippyAnimationXX 或者 onAnimationXX

4. hippy-react 初始化动画对象（new Animation），需要在根节点渲染之后，否则会因为 Dom Manager未创建提示报错
   hippy-vue/hippy-vue-next 初始化动画对象（new Animation），需要在 Vue.start 回调之后，否则会因为 Dom Manager未创建提示报错

5. hippy-react/hippy-vue/hippy-vue-next 如果使用了颜色属性的渐变动画，需要显示指定 color 单位，添加 valueType：'color' 字段，例如：

``` javascript
    animation: new Animation({
        startValue: 'red',
        toValue: 'yellow',
        valueType: 'color', // 颜色动画需显式指定color单位
        duration: 1000,
        delay: 0,
        mode: 'timing',
        timingFunction: 'linear',
    }),
```


# 验证关注点

一、Hippy 3.0 前端架构升级主要有如下改动点：
</br>

1. JS 驱动上屏的方式由 UIManagerModule 变为了 SceneBuilder。
2. Node API 重新实现了 Move 计算逻辑。
3. Event 由前端分发变为 DOM 分发。
4. 动画由 bridge 模块变为 C++ DOM 模块实现。

二、需要验证关注点：
</br>

1. 界面的UI视图渲染正常 （UI结构、样式属性等），特别关注 Hippy-React/Vue 中因为条件渲染语句，产生的节点`Move`操作，表现是否正常。
2. UI事件（点击、滑动）等表现正常，特别关注事件`冒泡`、`捕获`等表现是否正常。
3. 关注`动画`表现是否正常。

</br>
</br>

# 新特性

## Performance API

Hippy 3.0 我们实现了基于前端规范设计的性能 API，接入方式可参考 [Performance](feature/feature3.0/performance.md)。

## Layout 引擎支持切换

Hippy 3.0 我们支持了 Layout 引擎的无缝切换，项目可保持`Yoga`引擎，也可以选择Hippy自研的`Taitank`引擎。详情可参考 [Layout](feature/feature3.0/layout.md)
