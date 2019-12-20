import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  callNative,
} from 'hippy-react';

const styles = StyleSheet.create({
  stepText: {
    color: '#242424',
    marginBottom: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.clickToScan = this.clickToScan.bind(this);
  }

  clickToScan() {
    const { instanceId } = this.props;
    callNative('TestModule', 'scan', instanceId);
  }

  render() {
    return (
      <View style={styles.container} onClick={this.clickToScan}>
        <Text style={styles.stepText}>1.在PC端前端Hippy目录下终端执行`npm run build`</Text>
        <Text style={styles.stepText}>2.等待打包完毕，终端将会打印出iOS与Android双端的JS包二维码</Text>
        <Text style={styles.stepText}>3.点击下方按钮，开始扫码</Text>
        <Text style={styles.stepText}>4.扫码成功后，APP将会自动跳转到新的页面，展示刚才扫码的工程</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Text style={styles.buttonText} numberOfLines={1}>点击扫码</Text>
          </View>
        </View>
      </View>
    );
  }
}
