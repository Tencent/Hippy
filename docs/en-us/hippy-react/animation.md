# Animation Scheme

## Principle

The parameters of the animation in Hippy are completely passed in by the front end, and then the native controls the calculation and typesetting update of each frame, which reduces the number of communications between the front end and the native, and thus greatly reduces animation freezes.

## Cool Effect

* Follow animation

<img src="assets/img/follow_animation.gif" alt="Follow animation" width="30%"/>

* Smile animation

<img src="assets/img/smile_animation.gif" alt="Smile animation" width="30%"/>

* PK animation

<img src="assets/img/pk_animation.gif" alt="PK animation" width="30%"/>

## Let's Get Started

There are three steps to implementing an animation on Hippy:

1. Define animation with Animation or AnimationSet;
2. When calling render, animate the control properties that you want to animate;
3. Start the Animation through the start method of the animation, and stop and destroy the animation through the destroy method;

## Example Code

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

For detailed usage, please refer to [Animation module description](../hippy-react/modules.md?id=animation)
