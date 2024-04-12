# Hippy React&Vue 3.x SDK升级指引

> 这篇教程，主要介绍Hippy React&Vue 如何升级3.0版本以及升级后的相关验证关注点。

---

# 依赖升级

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

Hippy-React 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。

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

Hippy-Vue 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。



## hippy-vue-next

>如果业务目前使用 Vue 3.x 来开发 Hippy，可以参考当前章节升级指引。
</br>

需要升级如下版本依赖：

``` javascript
（1）@hippy/vue-next 升级到 3.2.0-beta 及以上
（2）@hippy/vue-css-loader 升级到 3.2.0-beta 及以上
（3）@hippy/vue-router-next-history 升级到 0.0.1
（4）vue 和 vue-router 等vue相关依赖无需升级
```

Hippy-Vue-Next 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。

</br>
</br>

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
