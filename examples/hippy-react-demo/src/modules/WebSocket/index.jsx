/* eslint-disable no-console */
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'hippy-react';

const styles = StyleSheet.create({
  buttonContainer: {
    height: 56,
    backgroundColor: '#4c9afa',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 56,
    color: '#fff',
  },
});

export default class WebSocketExpo extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentWillMount() {
    this.webSocekt = new WebSocket('ws://localhost:38989/debugger-live-reload');
    this.webSocekt.onopen = () => {
      this.webSocketOpened = true;
      console.log('WebSocket onOpen');
      this.webSocekt.send('Hello WebSocket');
    };

    this.webSocekt.onclose = (param) => {
      this.webSocketOpened = false;
      console.log(`WebSocket onClose: code = ${param.code}, reason = ${param.reason}`);
    };

    this.webSocekt.onerror = (param) => {
      console.log(`WebSocket onError: reason = ${param.reason}`);
    };

    this.webSocekt.onmessage = (message) => {
      console.log(`WebSocket onMessage: data type = ${message.type}`);

      // text类型的回包数据
      if (message.type === 'text') {
        console.log(`WebSocket onMessage: data type = ${message.data}`);
      }
    };
  }

  componentWillUnmount() {
    // close宜可不带参数this.webSocekt.close();
    if (this.webSocekt) {
      this.webSocekt.close(0, 'close websocket');
    }
  }

  onClick() {
    if (this.webSocketOpened && this.webSocekt) {
      this.webSocekt.send('Hello, WebSocket!');
    }
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.buttonContainer} onClick={this.onClick}>
          <Text style={styles.buttonText} numberOfLines={1}>测试WebSocket按钮</Text>
        </View>
      </ScrollView>
    );
  }
}
