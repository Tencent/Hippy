# 动画方案

## 原理

Hippy 的动画则是完全由前端传入动画参数，由终端控制每一帧的计算和排版更新，减少了前端端与终端的通信次数，因此也大大减少动画的卡顿。

## 酷炫的效果

* 关注动画

<img src="//res.imtt.qq.com/rn_ad/follow_animation.gif" alt="关注动画" width="30%"/>

* 点赞微笑动画

<img src="//res.imtt.qq.com/rn_ad/smile_animation.gif" alt="点赞微笑" width="30%"/>

* 进度条动画

<img src="//res.imtt.qq.com/rn_ad/pk_animation.gif" alt="PK进度条动画" width="30%"/>

## 让我们开始吧

在 Hippy 上实现一个动画分为三个步骤：

1. 通过 Animation 或 AnimationSet 定义动画
2. 在 render() 时，将动画设置到需要产生动画效果的控件属性上
3. 通过 Animation 的 start 方法启动动画，与通过 destroy 方法停止并销毁动画；

## 示例代码

```js
import { Animation, StyleSheet } from "@hippy/react";
import React, { Component } from "react";

export default class AnimationExample extends Component {
  componentDidMount() {
    // 动画参数的设置
    this.verticalAnimation = new Animation({
      startValue: 0, // 动画开始值
      toValue: 100, // 动画结束值
      duration: 500, // 动画持续时长
      delay: 360, // 至动画真正开始的延迟时间
      mode: "timing", // 动画模式，现在只支持timing
      timingFunction: "linear", // 动画缓动函数
    });
    this.horizonAnimation = new Animation({
      startValue: 0, // 开始值
      toValue: 100, // 动画结束值
      duration: 500, // 动画持续时长
      delay: 360, // 至动画真正开始的延迟时间
      mode: "timing", // 动画模式，现在只支持timing
      timingFunction: "linear", // 动画缓动函数
    });
    this.scaleAnimationSet = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 1,
            toValue: 1.4,
            duration: 200,
            delay: 0,
            mode: "timing",
            timingFunction: "linear",
          }),
          follow: false, // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 1.4,
            toValue: 0.2,
            duration: 210,
            delay: 200,
            mode: "timing",
            timingFunction: "linear",
          }),
          follow: true,
        },
      ],
    });
  }

  componentWillUnmount() {
    // 如果动画没有销毁，需要在此处保证销毁动画，以免动画后台运行耗电
    this.scaleAnimationSet && this.scaleAnimationSet.destroy();
    this.horizonAnimation && this.horizonAnimation.destroy();
    this.verticalAnimation && this.verticalAnimation.destroy();
  }

  render() {
    return (
      <View>
        <View style={styles.showArea}>
          <View
            style={[
              styles.square,
              {
                transform: [
                  {
                    scale: this.scaleAnimationSet,
                    translateX: this.horizonAnimation,
                    translateY: this.verticalAnimation,
                  },
                ],
              },
            ]}
          ></View>
        </View>
        <View style={styles.buttonContainer}>
          <View
            style={styles.button}
            onPress={() => {
              this.verticalAnimation.start();
            }}
          >
            <Text style={styles.buttonText}>水平位移动画</Text>
          </View>
          <View
            style={styles.button}
            onPress={() => {
              this.horizonAnimation.start();
            }}
          >
            <Text style={styles.buttonText}>垂直位移动画</Text>
          </View>
          <View
            style={styles.button}
            onPress={() => {
              this.scaleAnimationSet.start();
            }}
          >
            <Text style={styles.buttonText}>图形形变动画</Text>
          </View>
        </View>
      </View>
    );
  }
}

// 样式代码省略
```

`Animation` 和 `AnimationSet` 都是赋予 hippy 组件的单个样式属性（如 width，height，left，right）动画能力的模块。

`Animation`与`AnimationSet`的不同点在于`Animation`只是单个动画模块，`AnimationSet`为多个`Animation`的动画模块组合，支持同步执行或顺序执行多个`Animation`动画

Hippy 的动画能力支持位移，变形，旋转等功能，且因为动画对应的是样式属性，与支持动画集合`AnimationSet`，所以可以更加灵活地制作出炫丽的动画效果~

## 属性

Animation 支持的动画配置包括：

* mode ：动画模式，当前仅支持“timing”模式，即随时间改变控件的属性，默认配置即为"timing"；
* delay ：动画延迟开始的时间，单位为毫秒，默认为 0，即动画 start 之后立即执行；
* startValue ：动画开始时的值，可为 Number 类型或一个 Animation 的对象，如果指定为一个 Animation 时，代表本动画的初始值为其指定的动画结束或中途 cancel 后的所处的动画值（这种场景通常用于 AnimationSet 中实现多个连续变化的动画）；
* toValue ：动画结束时候的值，类型只能为 Number；
* valueType ：动画的开始和结束值的单位类型，默认为空，代表动画起止的单位是普通数值，另外可取值有：

  * “rad” ：代表动画参数的起止值为弧度；
  * “deg” ：代表动画参数的起止值为度数；
  * “color” ：代表动画参数的起止值为颜色；

* duration ：动画的持续时间，单位为毫秒，默认为 0；

* timingFunction ：动画插值器类型，默认为“linear”，可选值包括：

  * “linear”：使用线性插值器，动画将匀速进行；
  * “ease-in”：使用加速插值器，动画速度将随时间逐渐增加；
  * “ease-out”：使用减速插值器，动画速度将随时间逐渐减小；
  * “ease-in-out”：使用加减速插值器，动画速度前半段先随时间逐渐增加，后半段速度将逐渐减小；
  * “cubic-bezier”：(最低支持版本 2.9.0)使用自定义贝塞尔曲线，与 [css transition-timing-function 的 cubic-bezier](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) 一致；

* repeatCount ：动画的重复次数，默认为 0，即不重复播放，为"loop"时代表无限循环播放；

AnimationSet 为实现动画集合添加了 3 个属性

* children ：接收一个 Array，用于指定子动画，该 Array 的每个元素包括：
  * animation：子动画对应的 Animation 对象；
  * follow：配置子动画的执行是否跟随执行，为 true，代表该子动画会等待上一个子动画执行完成后在开始，为 false 则代表和上一个子动画同时开始，默认为 false；

## 方法

除了动画配置，Animation 与 AnimationSet 都提供了一系列控制和监听动画过程的方法：

* start() ：启动动画，注意，如果调用该方法前，动画尚未经过 render 赋值给相应控件或者该动画已经 destroy，那 start 将不会生效；
* destroy()：停止并销毁一个动画；
* updateAnimation( newConfig ) ：修改动画的配置参数，注意，如果动画已经 start 或 destroy，更新操作将不会生效，该方法接收的 newConfig 参数结构与 Animation 构造函数中动画配置参数一致；
* removeEventListener()：撤销所有注册的动画监听；

## 回调

* onAnimationStart(callback)：注册一个动画的监听回调，在动画开始时将会回调 callback；
* onAnimationEnd(callback)：注册一个动画的监听回调，在动画结束时将会回调 callback；
* onAnimationCancel(callback)：注册一个动画的监听回调，在动画被取消时将会回调 callback，取消的情况包括：尚未 start 或尚未结束的动画被 destroy 时；
* onAnimationRepeat(callback)：注册一个动画的监听回调，当动画开始下一次重复播放时 callback 将被回调；
