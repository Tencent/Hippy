# CSS 样式常见反馈

## 1. Hippy 设置百分比失效

Hippy 自研了排版引擎 [Taitank](https://github.com/Tencent/taitank), 为了追求极致的性能, 阉割了百分比的实现。
常见场景实现方案参考：

> 需要设置高度 100%

可设置 flex: 1

> 需要设置宽度 50%

可通过 Dimensions.screen 接口获取屏幕尺寸大小，然后计算相应百分比值

> 需要百分比实现

可以终端修改编译设置，把排版引擎切换为 [Yoga](https://doc.openhippy.com/#/feature/feature3.0/layout)

## 2. hippy支持 css var 的写法吗

可以先用 postcss 相关的插件来支持
