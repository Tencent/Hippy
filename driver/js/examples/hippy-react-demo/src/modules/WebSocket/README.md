### WebSocket组件的文档

1. 组件简介：Hippy支持WebSocket，这种协议可以在单个TCP连接上提供全双工的通信信道，这种通道属于长连接，Hippy提供的WebSocket接口与标准web的WebSocket接口一致。

2. 代码示例：

```js
import React from "react";
import { View } from "hippy-react";

export default class WebSocketExpo extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.webSocekt = new WebSocket("ws://websocket.test.qq.com/websocket");
        this.webSocekt.onopen = () => {
            this._webSocketOpened = true;
            console.log("WebSocket onOpen");
            this.webSocekt.send("Hello WebSocket")
        };

        this.webSocekt.onclose = (param) => {
            this._webSocketOpened = false;
            console.log("WebSocket onClose: code = " + param.code + ", reason = " + param.reason);
        };

        this.webSocekt.onerror = (param) => {
            console.log("WebSocket onError: reason = " + param.reason);
        };

        this.webSocekt.onmessage = (message) => {
            console.log("WebSocket onMessage: data type = " + message.type);

            //text类型的回包数据
            if(message.type === 'text') {
                console.log("WebSocket onMessage: data type = " + message.data);
            }
        };

    }

    componentWillUnmount() {
        //close宜可不带参数this.webSocekt.close();
        this.webSocekt && this.webSocekt.close(0, "close websocket");
    }

    onClick() {
        this._webSocketOpened && this.webSocekt && this.webSocekt.send("Hello, WebSocket!");
    }

    render() {
        return (
            <View onClick={this.onClick.bind(this)}>
            </View>
        );
    }
};

```

