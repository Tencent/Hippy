# 样式

Hippy 的所有样式支持由终端直接提供，基本和浏览器一致，但暂不支持百分比布局，但可以使用最新的 Flex 弹性布局。

# 内联样式

最简单的方式，我们可以用内联样式，直接定义容器如`View`，`Text`等的样式，用双括号包裹，示例代码如下：

```jsx  
import React from 'react';
import { View  } from '@hippy/react';

function InlineStyleDemo() {
  return (
    // 显示一个宽为100pt，高为100pt，背景颜色为红色的正方形在屏幕上
    return <View style={{ width: 100, height: 100, backgroundColor: 'red' }}/>;
  )
}
```

# 外部样式

当然，为了代码的整洁，我们更加推荐将样式用 [StyleSheet](hippy-react/modules.md?id=stylesheet) 统一管理，类似 HTML 编程指定 DOM 的 Class 后，再统一在 CSS 书写 Class 对应的样式，示例代码如下：

```jsx  
import React from 'react';
import { View, StyleSheet, Text } from '@hippy/react';

class StyleSheetDemo extends React.Component {
  render() {
    // 显示一个红色背景色，字体为白色的按钮
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText} numberOfLines={1}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 20,
    backgroundColor: 'red',
    borderRadius: 4,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText:{
    fontSize: 24,
    color: 'white',
  }
});
```

