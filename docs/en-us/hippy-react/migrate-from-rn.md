# Migrating From React Native

Hippy React is basically compatible with React Native syntax, but Hippy is more cohesive than the components provided by React Native, except that some components may need to be reimplemented through the front end. There are three main differences:

# Touch Screen - Touchable Series Components

Hippy's touch screen series events can be directly bound to View. The previous `Touchable` series components on RN can actually be easily migrated. Take `TouchableWithoutFeedback` as an example:

```jsx
import React from 'react';

function TouchableWithoutFeedback(props) {
  const child = React.Children.only(props.children);
  const { onClick, onPressIn, onPressOut } = props;
  const { children, ...nativeProps } = child.props;
  // event transparent transmission
  if (typeof onClick === 'function') {
    nativeProps.onClick = onClick;
  }
  if (typeof onPressIn === 'function') {
    nativeProps.onPressIn = onPressIn;
  }
  if (typeof onPressOut === 'function') {
    nativeProps.onPressOut = onPressOut;
  }
  return React.cloneElement(child, nativeProps, children);
}
```

# Animation System

Hippy's animation mechanism is different from React Native. The animation module of React Native is actually driven by the front end through a timer, and there is a lot of communication from the front end to the native, while Hippy has better animation performance by sending the animation scheme to the native at one time.

Please Refer to [best practices for animation schemes](hippy-react/animation.md).

# Gesture System

Hippy's gesture events are different from React Native's PanResponder and can be applied to any component, closer to the browser's implementation.

Please Refer to [best practices for gesture systems](hippy-react/gesture.md).
