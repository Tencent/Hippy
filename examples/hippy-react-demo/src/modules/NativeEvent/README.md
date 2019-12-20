### Text组件的文档

1. 组件简介： 本文组件，用于展示文字，可以支持文字的嵌套。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/Text/text000.png)

3. 代码示例：

```js

import { View, Text } from "hippy-react";

export default class TextExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View>
                <Text>Hello Hippy World :)</Text>
                <Text>Hello Hippy World :)</Text>
                <Text>Hello Hippy World :)</Text>
            </View>
        );
    }
}

```

