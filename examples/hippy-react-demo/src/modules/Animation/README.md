# 动画组件

## 初衷
React-Native有一套完善的动画机制，单它的动画都是由前端对每一帧进行计算，之后再生成绘制和排版命令到终端，由终端重新计算排版。因此存在对客户端性能要求高，绘制动画慢等问题。Hippy想在此做得更好，因为我们修改了动画机制

## 改进
Hippy的动画则是完全由前端传入动画参数，由终端控制每一帧的计算和排版更新，减少了js端与native端的通信次数，因此也大大减少动画的卡顿。 

## 酷炫的效果
 
 ![smile_animation](http://res.imtt.qq.com/rn_ad/smile_animation.gif)
 微笑动画
 ![pk_animation](http://res.imtt.qq.com/rn_ad/pk_animation.gif)
 PK进度条动画
 ![follow_animation](http://res.imtt.qq.com/rn_ad/follow_animation.gif)
## 让我们开始吧
在Hippy上实现一个动画分为三个步骤：

+ 通过Animation或AnimationSet定义动画
+ 在render时，将动画设置到需要产生动画效果的控件属性上
+ 通过Animation的start函数启动动画，与通过destroy函数停止并销毁动画；
## 示例代码
```js
import {Animation, StyleSheet} from "hippy-react";
import {Component} from 'react';

export default class AnimationExample extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        //动画参数的设置
        this.verticalAnimation = new Animation({
            startValue: 0,  //动画开始值
            toValue: 100,   //动画结束值
            duration: 500,   //动画持续时长
            delay: 360,     //至动画真正开始的延迟时间
            mode: "timing",  //动画模式，现在只支持timing
            timingFunction: "ease_bezier"  //动画缓动函数
        });
        this.horizonAnimation = new Animation({
            startValue: 0, //开始值
            toValue: 100, //动画结束值
            duration: 500, //动画持续时长
            delay: 360,   //至动画真正开始的延迟时间
            mode: "timing",  //动画模式，现在只支持timing
            timingFunction: "ease_bezier"  //动画缓动函数
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
                    }), follow: false   //配置子动画的执行是否跟随执行
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

    componentWillUnmount() {  //如果动画没有销毁，需要在此处保证销毁动画，以免动画后台运行耗电
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

//样式代码省略

```
 ``Animation`` 模块与``AnimationSet``都是赋予hippy组件的单个样式属性（如width，height，left，right）动画能力的模块。

``Animation``与``AnimationSet``的不同点在于``Animation``只是单个动画模块，``AnimationSet``为多个``Animation``的动画模块组合，支持同步执行或顺序执行多个``Animation``动画

Hippy的动画能力支持位移，变形，旋转等功能，且因为动画对应的是样式属性，与支持动画集合``AnimationSet``，所以可以更加灵活地制作出炫丽的动画效果~

##属性
Animation支持的动画配置包括：

+ mode ：动画模式，当前仅支持“timing”模式，即随时间改变控件的属性，默认配置即为"timing"；
+ delay ：动画延迟开始的时间，单位为毫秒，默认为0，即动画start之后立即执行；
+ startValue ：动画开始时的值，可为Number类型或一个Animation的对象，如果指定为一个Animation时，代表本动画的初始值为其指定的动画结束或中途cancel后的所处的动画值（这种场景通常用于AnimationSet中实现多个连续变化的动画）；
+ toValue ：动画结束时候的值，类型只能为Number；
+ valueType ：动画的开始和结束值的单位类型，默认为空，代表动画起止的单位是普通数值，另外可取值有： 
  + “rad” ：代表动画参数的起止值为弧度； 
  + “deg” ：代表动画参数的起止值为度数；

+ duration ：动画的持续时间，单位为毫秒，默认为0；

+ timingFunction ：动画插值器类型，默认为“linear”，可选值包括： 
  + “linear”：使用线性插值器，动画将匀速进行； 
  + “ease-in”：使用加速插值器，动画速度将随时间逐渐增加； 
  + “ease-out”：使用减速插值器，动画速度将随时间逐渐减小； 
  + “ease-in-out”：使用加减速插值器，动画速度前半段先随时间逐渐增加，后半段速度将逐渐减小； 
  + “ease_bezier”：使用贝塞尔插值器，动画速度跟随贝塞尔函数变化，贝塞尔函数参数0.42 -> 0 -> 1 -> 1；

+ repeatCount ：动画的重复次数，默认为0，即不重复播放，为"loop"时代表无限循环播放；
 
AnimationSet为实现动画集合添加了3个属性
+ children ：接收一个Array，用于指定子动画，该Array的每个元素包括： 
  + animation：子动画对应的Animation对象； 
  + follow：配置子动画的执行是否跟随执行，为true，代表该子动画会等待上一个子动画执行完成后在开始，为false则代表和上一个子动画同时开始，默认为false； 

## 方法
除了动画配置，Animation与AnimationSet都提供了一系列控制和监听动画过程的方法：

+ start() ：启动动画，注意，如果调用该方法前，动画尚未经过render赋值给相应控件或者该动画已经destroy，那start将不会生效；
+ destory()：停止并销毁一个动画；
+ updateAnimation( newConfig ) ：修改动画的配置参数，注意，如果动画已经start或destroy，更新操作将不会生效，该方法接收的newConfig参数结构与Animation构造函数中动画配置参数一致；
+ removeEventListener()：撤销所有注册的动画监听； 

## 回调
+ onHippyAnimationStart(callback)：注册一个动画的监听回调，在动画开始时将会回调callback；
+ onHippyAnimationEnd(callback)：注册一个动画的监听回调，在动画结束时将会回调callback；
+ onHippyAnimationCancel(callback)：注册一个动画的监听回调，在动画被取消时将会回调callback，取消的情况包括：尚未start或尚未结束的动画被destroy时；
+ onHippyAnimationRepeat(callback)：注册一个动画的监听回调，当动画开始下一次重复播放时callback将被回调；





