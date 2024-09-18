# 变形

该类样式可以对组件元素做一些基础变形，例如缩放、旋转、扭曲等等。

---

# transform

`transform` 可以传入多个变形的参数数组，完成对原元素的变形操作。例如：

```jsx
transform: [{ rotateX: '45deg' }, { rotateZ: '0.785398rad' }]
```

它与 CSS 的 transform 参数类似，请参考 [MDN](//developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 上的详细信息。

| 参数        | 描述                                                         | 类型     | 支持平台       |
| ----------- | ------------------------------------------------------------ | -------- | -------------- |
| perspective | 指定观察者与 z=0 平面的距离，默认值`1280`，Android 从 `3.2.0` 版本开始支持 | `number` | `Android、iOS` |
| rotate      | 旋转，角度或弧度                                             | `string` | `Android、iOS` |
| rotateX     | X轴旋转，角度或弧度                                          | `string` | `Android、iOS` |
| rotateY     | Y轴旋转，角度或弧度                                          | `string` | `Android、iOS` |
| rotateZ     | Z轴旋转（同rotate）                                          | `string` | `Android、iOS` |
| scale       | 缩放                                                         | `number` | `Android、iOS` |
| scaleX      | X轴缩放                                                      | `number` | `Android、iOS` |
| scaleY      | Y轴缩放                                                      | `number` | `Android、iOS` |
| translateX  | X轴平移                                                      | `number` | `Android、iOS` |
| translateY  | Y轴平移                                                      | `number` | `Android、iOS` |
| skewX       | X轴倾斜，角度或弧度                                          | `string` | `iOS`          |
| skewY       | Y轴倾斜，角度或弧度                                          | `string` | `iOS`          |

!> Android 不支持 `skewX` 和 `skewY` 。

!> Android 从 `3.2.0` 版本开始支持设置perspective，并把默认值改为和 iOS 一致。

!> Android 旧版本处理多个变形参数的顺序是反转的，从 `3.2.0` 开始改为和 iOS 一致。
