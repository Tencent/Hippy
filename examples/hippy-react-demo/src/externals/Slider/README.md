### Slider组件的文档

1. 组件简介：多图轮播组件，用于多张图片的轮流播放，可手动与自动控制。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/Slider/Slider_001.png)

3. 代码示例：

```js

import React from "react";
import { View, Text } from "hippy-react";
import {Slider} from "./Slider";

const IMAGE_URLS = [
    'http://res.imtt.qq.com/circle/real/1528701933567-.jpg',
    'http://res.imtt.qq.com/circle/real/1527758982390-20180530184743.jpg',
    'http://res.imtt.qq.com/circle/real/1527670660574-.jpg',
];

export default class SliderExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View>
                <Text style={info_style}>Auto:</Text>
                <Slider
                    style={slider_style}
                    images={IMAGE_URLS}
                    duration={1000}
                />
                <Text style={info_style}>Manual:</Text>
                <Slider
                    style={slider_style}
                    images={IMAGE_URLS}
                    duration={0}
                />
            </View>
        );
    }
}

var slider_style = {
    width: 400,
    height: 180,
};

var info_style = {
    height: 40,
    fontSize: 16,
    color: '#4c9afa',
    marginTop: 15,
};

```

