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

# CSS 选择器和 scoped 的支持

目前已经实现了基本的 `ID`、`Class`、`Tag` 选择器，而且可以支持基本的嵌套关系，其余选择器和 scoped 还未支持。



