# Style

All style support of Hippy is directly provided by the native, which is basically the same as that of the browser. It does not support percentage layout, but the latest Flex flexible layout can be used.

# Inline Style

The easiest way. We can use inline styles to directly define the styles of containers such as `View`, `Text`, etc., and wrap them in double brackets. The example code is as follows:

```jsx  
import React from 'react';
import { View  } from '@hippy/react';

function InlineStyleDemo() {
  return (
    // Display a square with a width of 100pt, a height of 100pt, and a red background color on the screen
    return <View style={{ width: 100, height: 100, backgroundColor: 'red' }}/>;
  )
}
```

# External Style

Of course, in order to keep the code clean, we recommend using [StyleSheet](hippy-react/modules.md?id=stylesheet) to manage the styles in a unified manner. After specifying the Class of the DOM similar to HTML programming, write the styles corresponding to the Class in CSS uniformly. The example code is as follows:

```jsx  
import React from 'react';
import { View, StyleSheet, Text } from '@hippy/react';

class StyleSheetDemo extends React.Component {
  render() {
    // Displays a button with a red background color and a white font
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

