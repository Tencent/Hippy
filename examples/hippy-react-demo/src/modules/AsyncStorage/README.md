### AsyncStorage组件的文档

1. 组件简介：异步存储组件，AsyncStorage是一个简单的、异步的、持久化的Key-Value存储系统，它对于App来说是全局性的。

2. 组件效果截图：

![](http://res.imtt.qq.com/hippydoc/expo/AsyncStorage/AsyncStorage_001.png)

3. 代码示例：

```js

import React from "react";
import { View, Text, TextInput, AsyncStorage, Modal } from "hippy-react";

export default class AsyncStorageExpo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: '',
        };
    }

    _onClickSet(e) {
        console.log('_onClickSet', JSON.stringify(e));
        console.log('Key', this.state.key, 'Value', this.state.value);
        let key = this.state.key;
        let value = this.state.value;
        if (!key) {
            return;
        }
        AsyncStorage.setItem(key, value);
    }

    _onClickGet(e) {
        console.log('_onClickGet', JSON.stringify(e));
        console.log('Key', this.state.key);
        let key = this.state.key;
        if (!key) {
            return;
        }
        AsyncStorage.getItem(key).then((res) => {
            console.log('Value', res);
            this.setState({
                result: res,
            });
        });

    }

    _onTextChangeKey(e) {
        console.log('_onTextChangeKey', JSON.stringify(e));
        this.setState({
            key: e,
        });
    }

    _onTextChangeValue(e) {
        console.log('_onTextChangeValue', JSON.stringify(e));
        this.setState({
            value: e,
        });
    }

    render() {
        return (
            <View style={container_style}>
                <View style={item_group_style}>
                    <Text style={info_style}>Key:</Text>
                    <TextInput style={input_style} onChangeText={this._onTextChangeKey.bind(this)}/>
                </View>
                <View style={item_group_style}>
                    <Text style={info_style}>Value:</Text>
                    <TextInput style={input_style} onChangeText={this._onTextChangeValue.bind(this)}/>
                </View>
                <View style={item_group_style} onClick={this._onClickSet.bind(this)}>
                    <Text style={button_style}>Set</Text>
                </View>

                <View style={[item_group_style, {marginTop: 60}]}>
                    <Text style={info_style}>Key:</Text>
                    <TextInput style={input_style} onChangeText={this._onTextChangeKey.bind(this)}/>
                </View>
                <View style={[item_group_style, {display: 'none'}]}>
                    <Text style={info_style}>Value:</Text>
                    <Text style={[info_style, {width: 200}]}>{"" + this.state.result}</Text>
                </View>
                <View style={item_group_style} onClick={this._onClickGet.bind(this)}>
                    <Text style={button_style}>Get</Text>
                </View>
            </View>
        );
    }
};

var container_style = {
    margin: 20,
    alignItems: 'center',
};

var item_group_style = {
    flexDirection: 'row',
    marginTop: 10,
};

var title_style = {
    marginTop: 15,
    fontSize: 24,
    color: '#4c9afa',
};

var info_style = {
    width: 60,
    height: 40,
    fontSize: 16,
    color: '#4c9afa',
    textAlign: 'center',
};

var input_style = {
    width: 200,
    height: 40,
    placeholderTextColor: '#aaaaaa',
    underlineColorAndroid: '#4c9afa',
    fontSize: 16,
    color: '#242424',
    textAlign: 'bottom',
};

var button_style = {
    width: 100,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#4c9afa',
    backgroundColor: '#4c9afa11',
    borderColor: '#4c9afa',
    borderWidth: 1,
    marginLeft: 10,
    marginRight: 10,
};

```

