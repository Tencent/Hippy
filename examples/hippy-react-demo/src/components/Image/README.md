### Image组件的文档

1. 组件简介：图片组件，一个用于显示多种不同类型图片的组件，包括网络图片、静态资源、临时的本地图片、以及本地磁盘上的图片（如相册）等。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/Image/Image_001.png)

3. 代码示例：

```js

import React from "react";
import { View, ScrollView, Text, Image } from "hippy-react";

export default class ImageExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <ScrollView style={container_style}>
                <Text style={info_style}>Contain:</Text>
                <Image style={[image_style, {resizeMode: 'contain'}]} src="http://zxpic.imtt.qq.com/zxpic_imtt/2018/06/08/2000/originalimage/200721_3738332814_3_540_364.jpg"></Image>
                <Text style={info_style}>Cover:</Text>
                <Image style={[image_style, {resizeMode: 'cover'}]} src="http://zxpic.imtt.qq.com/zxpic_imtt/2018/06/08/2000/originalimage/200721_3738332814_3_540_364.jpg"></Image>
                <Text style={info_style}>Center:</Text>
                <Image style={[image_style, {resizeMode: 'center'}]} src="http://zxpic.imtt.qq.com/zxpic_imtt/2018/06/08/2000/originalimage/200721_3738332814_3_540_364.jpg"></Image>
            </ScrollView>
        );
    }
};

var container_style = {
    alignItems: 'center',
};

var image_style = {
    width: 300,
    height: 180,
    margin: 10,
    borderColor: '#4c9afa',
    borderWidth: 1,
    backgroundColor: '#aaaaaa',
};

var info_style = {
    marginTop: 15,
    fontSize: 16,
    color: '#4c9afa',
};

```

