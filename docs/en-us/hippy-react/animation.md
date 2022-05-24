# Animation scheme

## Principle

The parameters of the animation in Hippy are completely passed in by the front end, and then the native controls the calculation and typesetting update of each frame, which reduces the number of communications between the front end and the native, and thus greatly reduces animation freezes.

## Cool effect

* Follow animation

<img src="assets/img/follow_animation.gif" alt="Follow animation" width="30%"/>

* Smile animation

<img src="assets/img/smile_animation.gif" alt="Smile animation" width="30%"/>

* PK animation

<img src="assets/img/pk_animation.gif" alt="PK animation" width="30%"/>

## Let's get started

There are three steps to implementing an animation on Hippy:

1. Define animation with Animation or AnimationSet;
2. When you render(), animate the control properties that you want to animate;
3. Start the Animation through the start method of the animation, and stop and destroy the animation through the destroy method;

## Example code

```js
import { Animation, StyleSheet } from "@hippy/react";
import React, { Component } from "react";

export default class AnimationExample extends Component {
  componentDidMount() {
    // Set animation parameters
    this.verticalAnimation = new Animation({
      startValue: 0, // Animation start value
      toValue: 100, // Animation end value
      duration: 500, // Animation duration
      delay: 360, // The delay time when the animation actually starts
      mode: "timing", // Animation mode, now only supports timing
      timingFunction: "linear", // Animation easing function
    });
    this.horizonAnimation = new Animation({
      startValue: 0, // Animation start value
      toValue: 100, // Animation end value
      duration: 500, // Animation duration
      delay: 360, // The delay time when the animation actually starts
      mode: "timing", // Animation mode, now only supports timing
      timingFunction: "linear", // Animation easing function
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
          follow: false, // Configure whether the execution of the sub-animation follows the execution
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
    // If the animation is not destroyed, you need to ensure that the animation is destroyed here, so as not to consume power when the animation runs in the background
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
            <Text style={styles.buttonText}>Horizontal displacement animation</Text>
          </View>
          <View
            style={styles.button}
            onPress={() => {
              this.horizonAnimation.start();
            }}
          >
            <Text style={styles.buttonText}>Vertical displacement animation</Text>
          </View>
          <View
            style={styles.button}
            onPress={() => {
              this.scaleAnimationSet.start();
            }}
          >
            <Text style={styles.buttonText}>Graphic deformation animation</Text>
          </View>
        </View>
      </View>
    );
  }
}

// Style code omitted
```

`Animation` and`AnimationSet` are modules that give the hippy component the ability to animate individual style properties (such as width, height, left, right).

`Animation`the`AnimationSet` difference between and is that it is`Animation` only a single animation module`AnimationSet`, which is a`Animation` combination of multiple animation modules and supports synchronous execution or sequential execution of multiple`Animation` animations.

Hippy's animation ability supports functions such as displacement, deformation, rotation, etc., and because animation corresponds to style attributes and supports animation collection`AnimationSet`, it can more flexibly produce dazzling animation effects ~

## Property

Animation configurations supported by animation include:

* mode: Animation mode, currently only supports "timing" mode, that is, the attribute of the control is changed with time, and the default configuration is "timing";
* delay: The time when the animation delay starts, in milliseconds, and the default value is 0, that is, it is executed immediately after the animation starts;
* startValue ： The value at the start of the animation. Can be a Number type or an Animation . If it is an Animation, it means that the initial value of the animation is the animation value after the specified animation ends or is canceled in the middle(this kind of scene is usually used to implement multiple continuously changing animations in an AnimationSet);
* toValue: The value at the end of the animation, the type can only be Number;
* valueType: The unit type for the animation's start and end values. The default value is empty, which means that the unit of animation start and end is a common value. Other possible values are:

  * "rad": Indicates that the start and stop values of animation parameters are radians;
  * "deg": Indicates that the start and stop values of animation parameters are degrees;
  * "color": Indicates that the start and stop values of animation parameters are color;

* duration: The duration of the animation, in milliseconds, the default is 0;

* timingFunction ：The animation interpolator type, the default is "linear", optional values include:

  * "animation": With a linear interpolator, the animation will proceed at a constant speed;
  * "ease in": With an acceleration interpolator, the animation speed will gradually increase over time;
  * "ease out": With a deceleration interpolator, the animation speed will gradually decrease with time;
  * “ease-in-out”：With an acceleration and deceleration interpolator, the animation speed will gradually increase with time in the first half, and gradually decrease in the second half;
  * “cubic-bezier”：(Minimum supported version 2.9.0) With a custom Bezier curve, consistent with the [transition-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function);

* repeatCount ： The number of repetitions of the animation. The default is 0, which means no repeat playback. When it is "loop", it means infinite loop playback;

AnimationSet adds 3 properties to implement the animation Collection:

* children: Receives an Array that specifies a child animation, and each element of the Array includes:
  * animation: The Animation object corresponding to the sub - Animation;
  * follow: Configure whether the execution of the sub - animation follows the execution. If it is`true`, the sub - animation will start after the execution of the previous sub - animation is completed; if it is, the sub - animation will start at the`false` same time as the previous sub - animation. The default value is`false`;

## Method

In addition to animation configuration, both Animation and AnimationSet provide a series of methods to control and monitor the animation process:

* start(): Start animation. note that if the animation has not been render and assigned to the correspond control or the animation has been destroyed before calling this method, start will not take effect;
* destroy(): Stop and destroy an animation;
* updateAnimation(newConfig) ：(Only for Animation) Modify the configuration parameters of the animation. Note that if the animation has been started or destroyed, the update operation will not take effect. The newConfig parameter structure received by this method is consistent with the animation configuration parameters in the Animation constructor;
* removeEventListener()： Cancel all registered animation listeners;

## Callback

* onAnimationStart(callback)： Register an animation listener callback, which will be called back when the animation starts;
* onAnimationEnd(callback)： Register an animation listener callback, which will be called back when the animation ends;
* onAnimationCancel(callback)： Register an animation listener callback, the callback will be called back when the animation is canceled; the cancellation includes: when the animation that has not yet started or has not ended is destroyed;
* onAnimationRepeat(callback)： Register an animation listener callback, which will be called back when the animation starts to repeat the next time；
