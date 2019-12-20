### NetInfo

1. **简介** 

    NetInfo模块是Hippy提供的Native能力之一，你通过该接口可以获得当前设备的网络状态，也可以注册一个监听器，当系统网络切换的时候，得到一个通知。

2. **效果截图**

![1](http://res.imtt.qq.com/hippydoc/expo/Netinfo/netinfo.png)

3. **代码示例**

```js

import React from "react";
import {View, StyleSheet, NetInfo, Text} from "hippy-react";

const styles = StyleSheet.create({
    text: {
        fontSize: 14,
        color: "#242424",
        alignSelf: "center"
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    }
});
export default class NetInfoExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            infoText: '正在获取..'
        };
        this.listener = null;
    }

    async componentWillMount() {
        let self = this;
        let netInfo = await NetInfo.fetch();
        this.setState({
            infoText: netInfo
        });
        this.listener = NetInfo.addEventListener('change', (netInfo) => {
            self.setState({
                infoText: '收到通知:' + netInfo.network_info
            })
        })
    }

    componentDidMount() {
        this.listener && NetInfo.removeEventListener('change', this.listener);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{this.state.infoText}</Text>
            </View>
        );
    }
}

```

