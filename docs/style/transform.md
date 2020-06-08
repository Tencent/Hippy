# 变形

该类样式可以对组件元素做一些基础变形，例如缩放、旋转、扭曲等等。

# transform

`transform` 可以传入多个变形的参数数组，完成对原元素的变形操作。例如：

```jsx
transform([{ rotateX: '45deg' }, { rotateZ: '0.785398rad' }])
```

它与 CSS 的 transform 参数类似，请参考 [MDN](//developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 上的详细信息。

| 类型                                                                                                                                                                                                                                                                                                                                                    | 必需 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| array of object: { perspective: number }, object: { rotate: string }, object: { rotateX: string }, object: { rotateY: string }, object: { rotateZ: string }, object: { scale: number }, object: { scaleX: number }, object: { scaleY: number }, object: { translateX: number }, object: {translateY: number}, object: { skewX: string }, object: { skewY: string } | 否       |
