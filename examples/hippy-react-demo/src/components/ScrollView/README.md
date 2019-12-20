### ScrollView组件的文档

1. 组件简介：滚动组件，用于展示不确定高度的内容，它可以将一系列不确定高度的子组件装到一个确定高度的容器中，使用者可通过上下或左右滚动操作查看组件宽高之外的内容。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/ScrollView/ScrollView_001.png)

3. 代码示例：

```js

import React from "react";
import { View, ScrollView, Text } from "hippy-react";

export default class ScrollExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    _onScroll(e) {
        this.setState({
            scrollOffset: Math.floor(e.contentOffset.x),
        });
    }

    _onClickScrollTo0() {
        this.refs.scrollview.scrollTo(0, 0, true);
    }

    render() {
        return (
            <View>
                <ScrollView
                    horizontal={true}
                    onScroll={this._onScroll.bind(this)}
                    ref="scrollview"
                >
                    <Text style={item_style}>A</Text>
                    <Text style={item_style}>B</Text>
                    <Text style={item_style}>C</Text>
                    <Text style={item_style}>D</Text>
                    <Text style={item_style}>E</Text>
                    <Text style={item_style}>F</Text>
                </ScrollView>
                <Text style={info_style}>{'Scroll Offset: ' + (this.state.scrollOffset || 0)}</Text>
                <Text style={button_style} onClick={this._onClickScrollTo0.bind(this)}>Scroll To Left</Text>
            </View>
        );
    }
}

var item_style = {
    width: 120,
    height: 200,
    borderWidth: 1,
    borderColor: '#4c9afa',
    fontSize: 80,
    color: '#4c9afa',
    textAlign: 'center',
    margin: 20,
};

var info_style = {
    margin: 20,
    fontSize: 16,
    color: '#4c9afa',
};

var button_style = {
    width: 100,
    height: 40,
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: '#4c9afa',
    backgroundColor: '#4c9afa11',
    borderColor: '#4c9afa',
    borderWidth: 1,
};

```

