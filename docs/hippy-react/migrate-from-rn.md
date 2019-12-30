# 从 React Native 迁移

Hippy React 基本兼容 React Native 语法，但相对 React Native 提供的组件，Hippy 更加内聚，除了部分组件可能需要通过前端重新实现，主要还有以下三个区别：

# 触屏 Touchable 系列组件

Hippy 的触屏系列事件可以直接绑定到 View 上，之前 RN 上的 `Touchable` 系列组件其实可以简单迁移过来。以 `TouchableWithoutFeedback` 为例：

```jsx
import React from 'react';

function TouchableWithoutFeedback(props) {
  const child = React.Children.only(props.children);
  const { onClick, onPressIn, onPressOut } = props;
  const { children, ...nativeProps } = child.props;
  // 透传事件
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

# 动画系统

Hippy 的动画机制和 React Native 机制有所不同，React Native 的动画模块其实是由前端通过定时器驱动，存在大量前终端通讯，而 Hippy 通过将动画方案一次性下发给终端实现了更好的动画性能。

请参考 [动画方案的最佳实践](hippy-react/best-practices.md?id=动画方案)。

# 手势系统

和 React Native 的 PanResponder 不同，Hippy 的手势事件可以应用于任何一个组件上，更加接近浏览器的实现。

请参考 [手势系统的最佳实践](hippy-react/best-practices.md?id=手势系统)。
