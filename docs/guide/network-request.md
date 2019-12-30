<!--  markdownlint-disable blanks-around-lists -->

# 网络请求

Hippy 直接支持 W3C 标准的 fetch 和 WebSocket 接口，可以通过这两个方法对服务器进行访问。

# fetch

Hippy 提供了跟 W3C 标准基本一致的 [fetch](//developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 方法，可以直接参考 [MDN](//developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)。

> 注意：`fetch` 目前仅支持 JSON 对象的传输，别的格式暂时无法支持。

## 发起请求

如果需要请求远程地址，只需要在 fetch 函数参数值传入地址即可，如下：

```javascript
fetch('//mywebsite.com/mydata.json');
```

fetch 函数也支持 HTTP 请求的配置。

```javascript
fetch('//mywebsite.com/endpoint/', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstParam: 'yourValue',
    secondParam: 'yourOtherValue',
  }),
});
```

完整的 fetch 请求属性列表可以[点击此处查看](//developer.mozilla.org/zh-CN/docs/Web/API/Request)。

## 处理返回值

返回数据将以 [Promise](//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的形式返回，示例如下：

```javascript
function getMoviesFromApi() {
  return fetch('//mywebsite.com/demo.json')
    .then(rsp => rsp.json())
    .then(json => json.movies)
    .catch(error => console.error(error));
}
```

可以使用 [async/await](//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function) 处理 fetch 返回的数据。

> 在使用 `fetch` 发起网络请求的时候，需要记得捕获错误，否则错误会被静默丢弃。

```javascript
async function getMoviesFromApi() {
  try {
    const rsp = await fetch('//mywebsite.com/demo.json');
    const json = await rsp.json();
    return responseJson.movies;
  } catch (error) {
    console.error(error);
  }
}
```

# WebSocket

`WebSocket` 协议可以在单个TCP连接上提供全双工的通信信道，是一种长连接的网络通道。

## 方法

### constructor

`(url: string, protocals: array, extrasHeaders: object)`
创建一个 WebSocket 对象，并开始向指定的 url 建立 Websocket 连接

> * `url`: string - WebSocket 的连接地址，以 ws:// 或 wss:// 开头的 url；
> * `protocals`: array - 可选字段，指定WebSocket希望采用的交流协议，array 内部的单个元素为必须为字符串类型，按优先级排序，该字段会最终组装到 WebSocket 的 Sec-WebSocket-Protocol 请求头中；
> * `extrasHeaders`: object- 可选字段，指定建立 WebSocket 时的一些额外请求头；

### close

`(code:  number, reason: string)`
主动关闭一条WebSocket，并向对端返回指定的code和reason

> * `code`: number - 可选字段，WebSocket关闭时，返回给对端的状态码；
> * `reason`: string- 可选字段，WebSocket关闭时，返回给对端的原因描述字符串；

### send

`(data: string)`
向对端发送一段数据，现阶段hippy仅支持发送文本数据，注意，请在明确收到 onopen 事件后才能真正发送数据，在连接尚未建立或已关闭的情况下发送数据会导致错误；

> * `data`: string- 向WebSocket对端发送的字符串数据；

## 属性

### readyState

`number，只读属性`
> 当前WebSocket的状态，取值为以下4种：
> * `0` - WebSocket正在连接中（Connecting）；
> * `1` - WebSocket连接建立成功，当前可以收发数据（Open）；
> * `2` - WebSocket连接正在关闭（Closing）；
> * `3` - WebSocket连接已关闭（Closed）；

### url

`string，只读属性`
当前 WebSocket 使用的 url

### onopen

`function，只写属性`
设置当前 WebSocket 在连接建立成功后的回调函数

### onclose

`function，只写属性`
设置当前WebSocket在连接关闭时的回调函数，回调函数带有一个参数（Object类型），参数属性说明如下：

> * `code` - number，连接关闭的状态码；
> * `reason` - string，连接关闭的原因描述；

### onmessage

`function，只写属性`
设置当前 WebSocket 在收到数据时的回调函数，回调函数带有一个参数（Object类型），参数属性说明如下：

> * `data` - string，实际收到的数据，由于当前Hippy WebSocket仅支持字符串数据的收发，这里一定为string类型；
> * `type` - string，收到的数据的类型，当前恒定为‘text’；

### onerror

`function，只写属性`
设置当前 WebSocket 在连接出现错误时的回调函数，回调函数带有一个参数（Object类型），参数属性说明如下：

> * `reason` - string，连接出现错误的的原因描述；

## 范例

``` jsx
import React from "react";
import { View } from "@tencent/hippy-react";

export default class WebSocketExpo extends React.Component {
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

      // text 类型的回包数据
      if (message.type == 'text') {
        console.log("WebSocket onMessage: data type = " + message.data);
      }
    };
  }

  componentWillUnmount() {
    // close 宜可不带参数 this.webSocekt.close();
    this.webSocekt && this.webSocekt.close(0, "close websocket");
  }

  onClick() {
      this._webSocketOpened && this.webSocekt && this.webSocekt.send("Hello, WebSocket!");
  }

  render() {
    return (
      <View onClick={this.onClick.bind(this)}></View>
    );
  }
};
```

# Cookie

Hippy 在接收来自服务器的 `set-cookie` header 时，会自动种入 cookie，下次再请求同域名服务时，就自动带上之前种下的 cookie。

但和浏览器不同，Hippy 内提供提供了 NetworkModule 提供了对 cookie 读取和修改，详情可以参考 hippy-react 的 [NetworkModule](hippy-react/modules.md?id=networkmodule)，或者 hippy-vue 的 [Vue.Native.Cookie](/hippy-vue/vue-native.md?id=cookie) 文档。

> 浏览器中对 Cookie 的读写时通过 document 对象操作的，但是 Hippy 中暂时不能直接出现全局的 document，否则部分库会运行一些在浏览器中才有的 document 方法，但 Hippy 中并没有，会导致崩溃。
