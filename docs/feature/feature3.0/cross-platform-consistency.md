# 双端一致性

## 改进背景

在之前的Hippy版本中，存在一些双端不一致的问题，比如某些属性在双端有不同的默认值、动画效果双端有差异等。这些问题不仅会增加开发成本，甚至可能影响到用户体验。因此，我们在Hippy 3.0对此重点进行了优化，以确保Hippy能够在不同平台上提供一致的开发体验和运行效果。

## 已修复的问题

以下列举部分重要且已经修复的一致性问题及其修改说明：

> 注意：部分改变属于breaking change，升级时可能需要对代码进行一些调整。

| 模块 | Hippy 2.0存在的问题 | Hippy 3.0的解决方案 |
|------|------|---------|
| 动画模块 | 在不同平台上，动画渲染效果不一致，主要表现为iOS动画存在较多问题。 | 优化动画渲染机制，iOS动画由CAAnimation驱动调整为DOM层驱动。 |
| 布局样式 | overflow属性在Android端默认值与iOS不同，且属性设置语法有差异。 | 调整Android端实现方式，对齐iOS。 |
| 布局样式 | backgroundImage的默认位置存在差异 | 统一默认值，对齐双端显示效果 |
| 文本组件 | Text组件嵌套Text或Image时双端显示效果不一致，且Android不支持tintColor、backgroundColor等样式设置 | 对齐双端显示效果，同时新增verticalAlign属性，支持更加灵活的文本排版控制 |
| 列表组件 | iOS端ListView组件不支持horizontal属性 | iOS端增加横向列表的支持，对齐Android。 |
| NetworkModule | fetch接口回调headers字段参数等不一致 | 统一双端回调参数及接口表现。 |

> 具体变更细节请参考对应组件或模块的接口说明。

## 即将解决的问题

我们还会在Hippy 3.0后续版本中逐步解决以下双端一致性问题：

- [ ] 阴影样式问题：阴影样式双端写法不同，显示效果略有差异；
- [ ] 文本样式问题：部分字体样式，如textDecorationColor、textDecorationStyle属性等双端支持存在差异，部分能力仅一端支持；
- [ ] onLayout回调问题：Android中onLayout事件默认从子组件向父组件冒泡，而iOS不冒泡；
- [ ] 部分手势事件回调时机不一致：onClick与onLongClick触发条件存在轻微差异；
- [ ] ListView组件部分回调时机不一致问题：onAppear/onDisappear/onEndReached等回调时机存在轻微差异；
- [ ] Image组件部分样式问题：resizeMode、capInsets等属性存在用法和效果差异；

> 以上仅列举部分差异，除此之外，部分UI组件和模块也存在轻微的不一致问题，我们将在Hippy 3.0中持续优化和改进。

如果您有任何问题或意见，欢迎随时发起Issue或提交PR，我们将第一时间跟进。
