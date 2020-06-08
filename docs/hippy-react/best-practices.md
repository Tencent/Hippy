# 最佳实践

本文通过几个常见的案例，给出了最佳的实现方案。

# 动画方案

## 原理

Hippy 的动画则是完全由前端传入动画参数，由终端控制每一帧的计算和排版更新，减少了前端端与终端的通信次数，因此也大大减少动画的卡顿。

## 酷炫的效果

关注动画

![关注动画](//res.imtt.qq.com/rn_ad/follow_animation.gif)

点赞微笑动画

![点赞微笑](//res.imtt.qq.com/rn_ad/smile_animation.gif)

PK进度条动画

![PK进度条动画](//res.imtt.qq.com/rn_ad/pk_animation.gif)

## 让我们开始吧

在Hippy上实现一个动画分为三个步骤：

1. 通过 Animation 或 AnimationSet 定义动画
2. 在 render() 时，将动画设置到需要产生动画效果的控件属性上
3. 通过 Animation 的 start 方法启动动画，与通过 destroy 方法停止并销毁动画；

## 示例代码

``` jsx
import { Animation, StyleSheet } from "@hippy/react";
import React, { Component } from 'react';

export default class AnimationExample extends Component {
  componentDidMount() {
    // 动画参数的设置
    this.verticalAnimation = new Animation({
      startValue: 0,           // 动画开始值
      toValue: 100,            // 动画结束值
      duration: 500,           // 动画持续时长
      delay: 360,             // 至动画真正开始的延迟时间
      mode: "timing",          // 动画模式，现在只支持timing
      timingFunction: "ease_bezier" // 动画缓动函数
    });
    this.horizonAnimation = new Animation({
      startValue: 0,           // 开始值
      toValue: 100,            // 动画结束值
      duration: 500,           // 动画持续时长
      delay: 360,             // 至动画真正开始的延迟时间
      mode: "timing",          // 动画模式，现在只支持timing
      timingFunction: "ease_bezier" // 动画缓动函数
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
            timingFunction: "linear"
          }), follow: false // 配置子动画的执行是否跟随执行
        },
        {
          animation: new Animation({
            startValue: 1.4,
            toValue: 0.2,
            duration: 210,
            delay: 200,
            mode: "timing",
            timingFunction: "linear"
          }), follow: true
        }
      ]
    });
  }

  componentWillUnmount() { // 如果动画没有销毁，需要在此处保证销毁动画，以免动画后台运行耗电
    this.scaleAnimationSet && this.scaleAnimationSet.destroy();
    this.horizonAnimation && this.horizonAnimation.destroy();
    this.verticalAnimation && this.verticalAnimation.destroy();
  }

  render() {
    return (
      <View>
          <View style={styles.showArea}>
            <View style={[styles.square, {
              transform: [{
                scale: this.scaleAnimationSet,
                translateX: this.horizonAnimation,
                translateY: this.verticalAnimation
              }],
            }]}>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.button} onPress={() => {
              this.verticalAnimation.start();
            }}>
              <Text style={styles.buttonText}>水平位移动画</Text>
            </View>
            <View style={styles.button} onPress={() => {
              this.horizonAnimation.start();
            }}>
              <Text style={styles.buttonText}>垂直位移动画</Text>
            </View>
            <View style={styles.button} onPress={() => {
              this.scaleAnimationSet.start();
            }}>
              <Text style={styles.buttonText}>图形形变动画</Text>
            </View>
          </View>
      </View>
    );
  }
}

// 样式代码省略

```

`Animation` 和 `AnimationSet` 都是赋予hippy组件的单个样式属性（如width，height，left，right）动画能力的模块。

`Animation`与`AnimationSet`的不同点在于`Animation`只是单个动画模块，`AnimationSet`为多个`Animation`的动画模块组合，支持同步执行或顺序执行多个`Animation`动画

Hippy的动画能力支持位移，变形，旋转等功能，且因为动画对应的是样式属性，与支持动画集合`AnimationSet`，所以可以更加灵活地制作出炫丽的动画效果~

## 属性

Animation支持的动画配置包括：

* mode ：动画模式，当前仅支持“timing”模式，即随时间改变控件的属性，默认配置即为"timing"；
* delay ：动画延迟开始的时间，单位为毫秒，默认为0，即动画start之后立即执行；
* startValue ：动画开始时的值，可为Number类型或一个Animation的对象，如果指定为一个Animation时，代表本动画的初始值为其指定的动画结束或中途cancel后的所处的动画值（这种场景通常用于AnimationSet中实现多个连续变化的动画）；
* toValue ：动画结束时候的值，类型只能为Number；
* valueType ：动画的开始和结束值的单位类型，默认为空，代表动画起止的单位是普通数值，另外可取值有：
  * “rad” ：代表动画参数的起止值为弧度；
  * “deg” ：代表动画参数的起止值为度数；

* duration ：动画的持续时间，单位为毫秒，默认为0；

* timingFunction ：动画插值器类型，默认为“linear”，可选值包括：
  * “linear”：使用线性插值器，动画将匀速进行；
  * “ease-in”：使用加速插值器，动画速度将随时间逐渐增加；
  * “ease-out”：使用减速插值器，动画速度将随时间逐渐减小；
  * “ease-in-out”：使用加减速插值器，动画速度前半段先随时间逐渐增加，后半段速度将逐渐减小；
  * “ease_bezier”：使用贝塞尔插值器，动画速度跟随贝塞尔函数变化，贝塞尔函数参数0.42 -> 0 -> 1 -> 1；

* repeatCount ：动画的重复次数，默认为0，即不重复播放，为"loop"时代表无限循环播放；

AnimationSet为实现动画集合添加了3个属性

* children ：接收一个Array，用于指定子动画，该Array的每个元素包括：
  * animation：子动画对应的Animation对象；
  * follow：配置子动画的执行是否跟随执行，为true，代表该子动画会等待上一个子动画执行完成后在开始，为false则代表和上一个子动画同时开始，默认为false；

## 方法

除了动画配置，Animation与AnimationSet都提供了一系列控制和监听动画过程的方法：

* start() ：启动动画，注意，如果调用该方法前，动画尚未经过render赋值给相应控件或者该动画已经destroy，那start将不会生效；
* destroy()：停止并销毁一个动画；
* updateAnimation( newConfig ) ：修改动画的配置参数，注意，如果动画已经start或destroy，更新操作将不会生效，该方法接收的newConfig参数结构与Animation构造函数中动画配置参数一致；
* removeEventListener()：撤销所有注册的动画监听；

## 回调

* onAnimationStart(callback)：注册一个动画的监听回调，在动画开始时将会回调callback；
* onAnimationEnd(callback)：注册一个动画的监听回调，在动画结束时将会回调callback；
* onAnimationCancel(callback)：注册一个动画的监听回调，在动画被取消时将会回调callback，取消的情况包括：尚未start或尚未结束的动画被destroy时；
* onAnimationRepeat(callback)：注册一个动画的监听回调，当动画开始下一次重复播放时callback将被回调；

# 手势系统

Hippy 的手势系统使用起来相对更加便捷，主要区别就在不需要再依赖其它事件组件，所有组件，包括 View、Text、Image 或各种自定义控件等都可以设置点击、触屏事件监听；

## 点击事件

点击事件包括长按、点击、按下、抬手4种类型，分别由以下4种接口通知：

1. onClick：当控件被点击时，会回调此函数；
2. onPressIn：在长按或点击时，用户开始触屏（即用户按下手指时）该控件时，此函数会被调用；
3. onPressOut：在长按或点击时，用户结束触屏（即用户抬起手指时）该控件时，此函数会被调用；
4. onLongClick：当控件被长按时，此函数会被调用；

### 范例

通过配合使用 onPressIn 和 onPressOut 可以实现点击态的效果，例如下面的示例代码，实现了点击时背景变色的功能：

``` jsx
render() {
  let bgColor = "#FFFFFF"; //非点击状态下背景为白色
  if (this.state.pressedIn) {
    bgColor = "#000000"; //点击状态下背景为黑色
  }

  return (
  <View style={{backgroundColor: bgColor}}
    onPressIn={() => { this.setState({pressedIn: true}) }}
    onPressOut={() => { this.setState({pressedIn: false}) }}
  >
    点击按钮
  </View>
  );
}
```

## 触屏事件

触屏事件的处理与点击事件类似，可以再任何React组件上使用，touch事件主要由以下几个回调函数组成：

1. onTouchDown(event)：当用户开始触屏控件时（即用户在该控件上按下手指时），将回调此函数，并将触屏点信息作为参数传递进来；
2. onTouchMove(event)：当用户在控件移动手指时，此函数会持续收到回调，并通过event参数告知控件的触屏点信息；
3. onTouchEnd(event)：当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event参数也会通知当前的触屏点信息；
4. onTouchCancel(event)：当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden），此函数会收到回调，触屏点信息也会通过event参数告知前端；

注意：若onTouchCancel被触发，则onTouchEnd不会被触发

以上回调函数均带有一个参数event，该数据包含以下结构：

* name：该触屏事件的名称，分别对应为“onTouchDown“、“onTouchMove”、"onTouchEnd"、“onTouchCancel”；
* id：接收触屏事件的目标控件的id，即触屏点所在控件的id；
* page_x：触屏点相对于根元素的横坐标；
* page_y：触屏点相对于根元素的纵坐标；

以上结构中的x和y坐标已经经过转换，与屏幕分辨率无关的单位，例如onTouchDonw回调的event参数结构如下：

```json
{ name: "onTouchDown", page_y: 172.27392578125, id: 6574, page_x: 532.6397094726562 }
```

## 事件冒泡

点击事件和触屏事件均可以在回调函数中定义是否需要冒泡该事件到上层组件，点击或触屏事件发生时，终端会寻找该触屏点下声明了要处理该事件的最小控件：

1. 返回 true 或没有返回值：控件处理完事件后，将不再继续冒泡，整个手势事件处理结束；
2. 返回 false：控件处理完事件后，事件将继续往上一层冒泡，如果找到某个父控件也设置了对应事件处理函数，则会调用改该回调函数，并再次根据其返回值决定是否继续冒泡。如果再向上冒泡的过程中达到了根节点，则事件冒泡结束；

我们通过以下示例进一步说明事件冒泡的机制：

```jsx
render() {
  return (
    <View style={{ width: 300, height: 200, backgroundColor: "#FFFFFF" }}
      onClick={() => { console.log("根节点 点击"); }}
    >
      <Text style={{ width: 150, height: 100, backgroundColor: "#FF0000" }}
        onClick={() => console.log("点击按钮1 点击")}
      >
        点击按钮1
      </Text>
      <View style={{ width: 150, height: 100, backgroundColor: "#00FF00" }}
        onClick={() => {
          console.log("父控件 点击");
          return true;
        }}
      >
        <Text style={{ width: 80, height: 50, backgroundColor: "#0000FF" }}
          onClick={() => {
            console.log("点击按钮2 点击");
            return false;
          }}
        >
          点击按钮2
        </Text>
      </View>
    </View>
  );
}
```

## 事件的拦截

某些场景下，父控件又需要优先拦截到子控件的手势事件，因此 Hippy 也提供了手势事件拦截机制，手势拦截由父控件的两个属性控制 `onInterceptTouchEvent` 和`onInterceptPullUpEvent`，这两个属性仅对能容纳子控件的组件生效，如 `<Image/>` 这种控件就不支持这两个属性：

* onInterceptTouchEvent：父控件是否拦截所有子控件的手势事件，true 为拦截，false 为不拦截（默认为false）。当父控件设置该属性为true时，所有其子控件将无法收到任何touch事件和点击事件的回调，不管是否有设置事件处理函数，在该父控件区域内按下、移动、抬起手指以及点击和长按发生时，终端将默认把事件发送给该父控件进行处理。如果父控件在设置onInterceptTouchEvent 为true之前，子控件已经在处理touch事件，那么子控件将收到一次onTouchCancel回调（如果子控件有注册该函数）；
* onInterceptPullUpEvent：该属性的作用与onInterceptTouchEvent 类似，只是决定父控件是否拦截的条件稍有不同。为true时，如果用户在当前父控件区域内发生了手指上滑的动作，后续所有的触屏事件将被该父控件拦截处理，所有其子控件将无法收到任何touch事件回调，不管是否有设置touch事件处理函数；如果拦截生效之前子控件已经在处理touch事件，子控件将收到一次onTouchCancel回调。为false时，父控件将不会拦截事件，默认为false；

注意，由于这两种标记拦截条件不同，onInterceptTouchEvent标记设置为true之后，子控件的所有触屏事件都将失效，而 onInterceptPullUpEvent 则不会影响子控件的点击事件。

还是以代码为例：

```jsx
render() {
  return (
    <View style={{ width: 300, height: 200, backgroundColor: "#FFFFFF" }}
      onTouchMove={(event) => { console.log("根节点 TouchMove：" + JSON.stringify(event))； }}
    >
      <View style={{ width: 150, height: 100, backgroundColor: "#FF0000" }}
        onTouchMove={evt => console.log("红色区域 TouchMove：" + JSON.stringify(event)) }
        onTouchDown={(event) => {
          console.log("红色区域 onTouchDown：" + JSON.stringify(event));
        }}/>
      <View style={{ width: 150, height: 100, backgroundColor: "#00FF00" }}
        onTouchMove={(event) => {
          console.log("绿色区域 TouchMove：" + JSON.stringify(event));
          return false;
        }}
        onInterceptTouchEvent={true}
      >
        <View style={{ width: 80, height: 50, backgroundColor: "#0000FF" }}
          onTouchMove={(event) => {
            console.log("蓝色区域 TouchMove：" + JSON.stringify(event));
            return false;
          }}/>
      </View>
    </View>
  );
}
```
