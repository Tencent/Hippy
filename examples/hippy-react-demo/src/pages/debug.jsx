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
    const stepTextArray = [
      '2. 在前端项目中使用 npm install 安装依赖',
      '3. 在前端项目中运行 npm run hippy:dev 编译调试包',
      '4. 另开一个命令行窗口，运行 npm run hippy:debug 启动调试服务',
      '5. 点击下方的“开始调试”按钮开始调试业务包',
    ];
    if (Platform.OS === 'android') {
      stepTextArray.unshift('1. 使用 USB 线连接 Android 手机和电脑，并启动 Hippy');
      stepTextArray.push(
        '6. 打开 chrome://inspect，需要确保 localhost:38989 在 Discover network targets 右侧的 Configuration 弹窗中，下方会出现设备列表，点击 Inspect 进行调试',
      );
    } else if (Platform.OS === 'ios') {
      stepTextArray.unshift('1. 启动 iOS 模拟器并启动打开 HippyDemo');
      stepTextArray.push(
        '6. 打开 Safari -> Develop 菜单进行调试（需要在预置 -> 高级里打开开发者菜单）',
      );
      stepTextArray.push('注意：每次插拔 USB 线后都需要通过 npm run hippy:debug 重启调试服务');
    }
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
