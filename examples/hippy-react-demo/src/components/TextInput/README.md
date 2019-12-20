### TextInput组件的文档

1. 组件简介：本文输入组件，允许用户在应用中通过键盘输入文本。组件支持多种属性配置，如单行、占位文字、不同键盘类型等。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/TextInput/TextInput_001.png)

3. 代码示例：

```js

import React from "react";
import { View, Text, TextInput } from "hippy-react";

export default class TextInputExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={container_style}>
                <TextInput
                    style={input_style}
                    placeholder={"PlaceHolder"}
                ></TextInput>
                <TextInput
                    style={input_style}
                    keyboardType={"tel"}
                    placeholder={"Tel"}
                ></TextInput>
                <TextInput
                    style={input_style}
                    keyboardType={"password"}
                    placeholder={"Password"}
                ></TextInput>
                <TextInput
                    style={input_style}
                    placeholder={"MaxLength=5"}
                    maxLength={5}
                ></TextInput>
            </View>
        );
    }
};

var container_style = {
    alignItems: 'center',
};

var input_style = {
    width: 200,
    margin: 20,
    placeholderTextColor: '#aaaaaa',
    underlineColorAndroid: '#4c9afa',
    fontSize: 16,
    color: '#242424',
    textAlign: 'bottom',
};

```

