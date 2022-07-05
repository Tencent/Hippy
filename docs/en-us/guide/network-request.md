<!--  markdownlint-disable blanks-around-lists -->

# Network request

Hippy directly supports the `fetch` and `WebSocket` interfaces of the W3C standard, and can access the server through these two methods.

# fetch

Hippy provides a [fetch](//developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) method that is basically consistent with the W3C standard. You can directly refer to [MDN](//developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API).

>Note:`fetch` at present, only the transmission of JSON objects is supported, and other formats can not be supported temporarily.

## Initiate request

If you need to request a remote address, you only need to pass in the address in the parameter value of the `fetch` function, as follows:

```javascript
fetch('//mywebsite.com/mydata.json');
```

The `fetch` function also supports the configuration of HTTP requests.

> only support `method | headers | body` parameters at lower version, version `2.14.0` or above support any customized parameters, e.g. `redirect: 'follow'`

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
  redirect: 'follow', // version `2.14.0` or above 
});
```

A complete list of fetch request attributes can be [Click here to view](//developer.mozilla.org/zh-CN/docs/Web/API/Request).

## Processing return values

The returned data will be returned to the [Promise](//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise), for example:

```javascript
function getMoviesFromApi() {
  return fetch('//mywebsite.com/demo.json')
    .then(rsp => rsp.json())
    .then(json => json.movies)
    .catch(error => console.error(error));
}
```

You can use [async/await](//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function) to process the data returned by `fetch`.

>When using to `fetch` initiate network requests, remember to catch errors, otherwise the errors will be silently discarded.

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

`Websocket` protocol can provide full duplex communication channel on a single TCP connection. It is a long connection network channel.

## Method

### constructor

`(url: string, protocals: array, extrasHeaders: object)`
Creates a `WebSocket` object and begins to establish a `Websocket` connection to the specified url

> * `url`: String. Websocket connection address, URL starting with ws:// or wss://.
> * `protocals`: Array. Optional field. Specify the communication protocol that WebSocket wants to adopt. The single element inside array must be of String type and sorted by priority. This field will be finally assembled into the Sec-Websocket-Protocol request header of Websocket.
> * `extrasHeaders`: Object. Optional field. Specify some additional request headers when establishing WebSocket.

### close

`(code:  number, reason: string)`
Actively close a WebSocket and return the specified code and reason to the peer

> * `code`: Number. Optional field. The status code returned to the opposite end when WebSocket is closed.
> * `reason`: String. Optional field. The reason description string returned to the opposite end when WebSocket is closed.

### send

`(data: string)`
Send a piece of data to the opposite end. At this stage, Hippy only supports sending text data. Please send data only after receiving `onopen` event. Sending data when the connection is not established or closed will cause errors.

> * `data`: String. String data sent to the opposite end of WebSocket.

## Property

### readyState

`number, read-only attribute`
> The current WebSocket status has the following 4 values:
> * `0` - WebSocket is connecting(Connecting).
> * `1` - Websocket connection is established successfully. Data can be sent and received at present(Open).
> * `2` - Websocket connection closing(Closing).
> * `3` - Websocket connection closed(Closed).

### url

`string, read-only attribute`
URL currently used by websocket

### onopen

`function, write-only attribute` 
Set the callback function of the current WebSocket after the connection is successfully established

### onclose

`function, write-only attribute`
Set the callback function of the current WebSocket when the connection is closed. The callback function has a parameter (Object type). The parameter properties are described as follows:

> * `code` Number. Status code of connection closing;
> * `reason` String. Description of the reason why the connection was closed

### onmessage

`function, write-only attribute` Set the callback function of the current WebSocket when receiving data. The callback function has a parameter (Object type). The parameter attributes are described as follows:

> * `data` String. The actually received data must be of string type because the current Hippy WebSocket only supports the sending and receiving of string data;
> * `type` String. The type of data received, which is currently constant as' text ';

### onerror

`function, write-only attribute`
Set the callback function of current WebSocket in case of connection error. The callback function has a parameter (Object type). The parameter attribute is described as follows:

> * `reason` String. Description of the cause of connection error;

## Example

``` jsx
import React from "react";
import { View } from "@hippy/react";

export default class WebSocketExpo extends React.Component {
  componentWillMount() {
    this.webSocekt = new WebSocket("ws://websocket.xx.com/websocket");
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

      // The packet return data is of type text
      if (message.type == 'text') {
        console.log("WebSocket onMessage: data type = " + message.data);
      }
    };
  }

  componentWillUnmount() {
    // close should be possible without the parameter this webSocekt.close();
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

When Hippy receives the `set-cookie` header from the server, it will automatically seed the cookie, and the next time it requests the same domain name service, it will automatically bring the cookie planted before.

But different from the browser, Hippy provides `NetworkModule` to read and modify cookies. For details, please refer to the [NetworkModule](hippy-react/modules.md?id=networkmodule) document of Hippy-React or the [Vue.Native.Cookie] (/hippy-vue/vue-native.md?id=cookie) document of Hippy-Vue.

>The reading and writing of cookies in the browser is operated through the document Object, but the global document can not directly appear in Hippy for the time being. Otherwise, some libraries will run some document methods that are only available in the browser, but not in Hippy, which will cause crash.
