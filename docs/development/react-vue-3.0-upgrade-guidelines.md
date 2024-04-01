# Hippy React&Vue 3.x SDK升级指引

> 这篇教程，主要介绍Hippy React&Vue 如何升级3.0版本以及升级后的相关验证关注点。

---

# hippy-react

如果业务目前使用 React 来开发 Hippy，可以参考当前章节升级指引。
</br>

如果当前 @hippy/react 版本小于 2.12.0, 且 React 使用的 16 的版本，则需要升级如下版本：

``` javascript
（1）删除 react-reconciler 依赖
（2）@hippy/react 升级到 3.0.2-beta 以上
（3）新增 @hippy/react-reconciler 依赖，使用react17的tag，即 @hippy/react-reconciler: react17
（4）React 版本升级到 17，即 react: "^17.0.2"
（5）如果使用了 @hippy/react-web 包做h5同构，则需要升级 @hippy/react-web 到 3.0.2-beta 以上
```

如果当前 @hippy/react 版本大于 2.12.0, 且 React 使用的 17 的版本，则需要升级如下版本：

``` javascript
（1）@hippy/react 升级到 3.0.2-beta 以上
（2）升级 @hippy/react-reconciler 依赖，使用react17的tag，即 @hippy/react-reconciler: react17
（3）如果使用了 @hippy/react-web 包做h5同构，则需要升级 @hippy/react-web 到 3.0.2-beta 以上
```

Hippy-React 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。

验证关注点：

1. 界面的UI视图渲染正常 （UI结构、样式属性等）
2. UI事件（点击、滑动）等表现正常
3. 自定义组件渲染正常
4. 自定义模块通讯正常
5. 动态加载js bundle流程正常
6. 页面冷启动、卡顿等性能数据正常
7. 页面曝光上报/日志上报正常

# hippy-vue

>如果业务目前使用 Vue 2.x 来开发 Hippy，可以参考当前章节升级指引。
</br>

需要升级如下版本依赖：

``` javascript
（1）@hippy/vue 升级到 3.0.2-beta 以上
（2）@hippy/vue-native-components 升级到 3.0.2-beta 以上
（3）@hippy/vue-router 升级到 3.0.2-beta 以上
（4）@hippy/vue-css-loader 升级到 3.0.2-beta 以上
（5）@hippy/vue-loader 升级到 3.0.2-beta 以上
（6）vue 和 vue-router等vue相关依赖无需升级
```

Hippy-Vue 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。

验证关注点：（同Hippy React）

1. 界面的UI视图渲染正常 （UI结构、样式属性等）
2. UI事件（点击、滑动）等表现正常
3. 自定义组件渲染正常
4. 自定义模块通讯正常
5. 动态加载js bundle流程正常
6. 页面冷启动、卡顿等性能数据正常
7. 页面曝光上报/日志上报正常

# hippy-vue-next

>如果业务目前使用 Vue 3.x 来开发 Hippy，可以参考当前章节升级指引。
</br>

需要升级如下版本依赖：

``` javascript
（1）@hippy/vue-next 升级到 3.0.2-beta 以上
（2）@hippy/vue-router-next-history 升级到 3.0.2-beta 以上
（3）@hippy/vue-css-loader 升级到 3.0.2-beta 以上
（4）vue 和 vue-router 等vue相关依赖无需升级
```

Hippy-Vue-Next 在升级3.0可以完全兼容之前的版本，除了升级如上依赖，业务代码不需要做修改。

验证关注点：（同Hippy React）

1. 界面的UI视图渲染正常 （UI结构、样式属性等）
2. UI事件（点击、滑动）等表现正常
3. 自定义组件渲染正常
4. 自定义模块通讯正常
5. 动态加载js bundle流程正常
6. 页面冷启动、卡顿等性能数据正常
7. 页面曝光上报/日志上报正常
