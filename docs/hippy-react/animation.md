# 动画方案

## 原理

Hippy 的动画则是完全由前端传入动画参数，由终端控制每一帧的计算和排版更新，减少了前端端与终端的通信次数，因此也大大减少动画的卡顿。

## 酷炫的效果

* 关注动画

<img src="assets/img/follow_animation.gif" alt="关注动画" width="30%"/>

* 点赞微笑动画

<img src="assets/img/smile_animation.gif" alt="点赞微笑" width="30%"/>

* 进度条动画

<img src="assets/img/pk_animation.gif" alt="PK进度条动画" width="30%"/>

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

详细使用，可以参考 [Animation 模块说明](../hippy-react/modules.md?id=animation)
