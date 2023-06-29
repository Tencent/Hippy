# 路由

@hippy/vue-next 中不再需要对 vue-router 做侵入修改，直接使用官方 vue-router npm 包即可

文档可以直接进行参考：[vue-router 官方网站](//router.vuejs.org/) 。

但不支持页面切换时的动画效果，因为 `<transition>` 组件尚未实现。

>如果要为 Android 加上触发物理返回键时优先回退历史记录的逻辑，可以引入 @hippy/vue-router-next-history，该 package 对 vue-router 的 history 模式做了处理，具体使用可以参考[说明](api/hippy-vue-next/introduction?id=初始化)
