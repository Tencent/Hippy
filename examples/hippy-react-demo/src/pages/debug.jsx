import React, { Component } from 'react';
import {
  callNative,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'hippy-react';

const styles = StyleSheet.create({
  stepText: {
    color: '#242424',
    marginBottom: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    width: 120,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4c9afa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 40,
    color: '#fff',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
  },
});

export default class Debug extends Component {
  constructor(props) {
    super(props);
    this.clickToDebug = this.clickToDebug.bind(this);
  }

  clickToDebug() {
    const { instanceId } = this.props;
    callNative('TestModule', 'debug', instanceId);
  }

  render() {
    const stepTextArray = Platform.OS === 'android' ? [
      '1.在PC端前端Hippy目录下终端执行`npm start`',
      '2.连接PC与安卓机器',
      '3.终端执行`adb reverse --remove-all`与`adb reverse tcp:8082 tcp:8082`两行命令',
      '4.点击下方按钮，开始调试',
      '5.可以在调试过程中点击左上角小圆点，选择`enable remote debug`在chrome执行断点调试',
    ] : [
      '1.在PC端前端Hippy目录下终端执行`npm start`',
      '2.打开iOS模拟器，运行hippy终端工程',
      '3.点击下方按钮，开始调试',
      '4.可以在调试过程中按下`command+d`，选择开启debug模式，在chrome执行断点调试',
    ];
    // eslint-disable-next-line react/no-array-index-key
    const renderSteps = () => stepTextArray.map((v, i) => <Text style={styles.stepText} key={`steps-${i}`}>{v}</Text>);
    return (
      <ScrollView style={styles.container}>
        {renderSteps()}
        <View style={styles.buttonContainer}>
          <View style={styles.button} onClick={this.clickToDebug}>
            <Text style={styles.buttonText} numberOfLines={1}>点击调试</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
