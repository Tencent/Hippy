import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  callNative,
  HippyEventEmitter,
} from 'hippy-react';

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: '#242424',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  itemContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 100,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  normalText: {
    fontSize: 14,
    lineHeight: 18,
    fontColor: 'black',
  },
});

export default class NativeEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoText: '',
      infoText2: '',
    };
  }

  render() {
    const { infoText, infoText2 } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View
          style={styles.itemTitle}
          onPress={() => {
            const hippyEventEmitter = new HippyEventEmitter();
            this.call = hippyEventEmitter.addListener('NORMAL_EVENT', (e) => {
              this.setState({
                infoText: JSON.stringify(e),
              });
            });
            callNative('MyEvent', 'btnClicked');
          }}
        >
          <Text>客户端向前端单向通信</Text>
          <Text>点此终端会发送NORMAL_EVENT事件</Text>
          <Text>{ `事件接收结果：${infoText}` }</Text>
        </View>
        <View
          style={styles.itemTitle}
          onPress={() => {
            const hippyEventEmitter = new HippyEventEmitter();
            this.call = hippyEventEmitter.addListener('COUNT_DOWN', (e) => {
              this.setState({
                infoText2: JSON.stringify(e),
              });
            });
            callNative('MyEvent', 'addListener', 'COUNT_DOWN');
          }}
        >
          <Text>客户端向前端单向通信的进阶用法</Text>
          <Text>点此终端会发送COUNT_DOWN事件</Text>
          <Text>{ `事件接收结果：${infoText2}` }</Text>
        </View>
      </ScrollView>
    );
  }
}
