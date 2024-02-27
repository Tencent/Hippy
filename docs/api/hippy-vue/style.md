# 样式

标准 Hippy 中长度单位是不允许带有单位，不过为了和浏览器保持兼容，hippy-vue 采取了 1px = 1pt 的方案进行换算，把 CSS 单位中的 px 直接去掉变成了 Hippy 中不带单位的数字。

HippyVue 提供了 `beforeLoadStyle` 的 Vue options 勾子函数，供开发者做定制化修改 CSS 样式，如

```js
    new Vue({
      // ...
      beforeLoadStyle(decl) {
         let { type, property, value } = decl;
         console.log('property|value', property, value); // => height, 1rem
          // 比如可以对 rem 单位进行处理
         if(typeof value === 'string' && /rem$/.test(value)) {
             // ...value = xxx
         } 
         return { ...decl, value}
      }
    });
```

beforeLoadStyle 默认是对全局节点生效的，针对不需要执行 beforeLoadStyle 的节点，可以对节点设置属性 beforeLoadStyleDisabled。
对于所有节点（如 div、p、button等均可使用）

```js
    <div 
        :beforeLoadStyleDisabled = "true">
    </div> 
```

# CSS 选择器

目前已经实现了基本的 `Universal`、`Type`、`ID`、`Class`、`Grouping` 选择器，而且可以支持除兄弟组合器以外的基本组合关系。

## Scoped & Attribute

> `2.15.0` 版本增加支持 Vue `scoped` 样式能力, `2.15.2` 支持子组件根元素样式合并

> `2.15.1` 版本增加支持 `Attribute` 选择器和 Vue `deep` 深度选择器

如何开启？

1. 升级 `@hippy/vue` 和 `@hippy/vue-css-loader` 到 `2.15.1+` 版本
2. Vue2.0 设置全局开关 `Vue.config.scoped = true;`（Vue2.0 默认 `scoped` 和 `Attribute` 选择器能力关闭，Vue3.0 默认开启无需设置开关）



