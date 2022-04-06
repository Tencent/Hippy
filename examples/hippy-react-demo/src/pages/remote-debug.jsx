import React, { useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  callNative,
} from '@hippy/react';

const styles = StyleSheet.create({
  stepText: {
    color: '#242424',
    marginBottom: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 20,
  },
  button: {
    width: 140,
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
  inputStyle: {
    width: 350,
    marginTop: 30,
    marginBottom: 10,
    placeholderTextColor: '#aaaaaa',
    fontSize: 16,
    color: '#242424',
    height: 80,
    lineHeight: 30,
    borderColor: '#eee',
    borderWidth: 1,
    borderStyle: 'solid',
  },
});

export default function RemoteBundleExample({ instanceId }) {
  const inputBundleURL = useRef(null);
  const openBundle = () => {
    blur();
    inputBundleURL.current.getValue().then((bundleURL) => {
      if (!bundleURL) return;
      callNative('TestModule', 'remoteDebug', instanceId, bundleURL);
    });
  };
  const blur = () => {
    inputBundleURL.current.blur();
  };

  const tips = [
    '安装远程调试依赖： npm i -D @hippy/debug-server-next@latest',
    '修改 webpack 配置，添加远程调试地址',
    '运行 npm run hippy:dev 开始编译，编译结束后打印出 bundleUrl 及调试首页地址',
    '粘贴 bundleUrl 并点击开始按钮',
    '访问调试首页开始远程调试，远程调试支持热更新（HMR）',
  ];

  return (
    <ScrollView style={styles.container} onClick={blur}>
      {
        tips.map((v, i) => (
          <Text style={styles.stepText} key={`steps-${i}`}>{i + 1}. {v}</Text>
        ))
      }
      <TextInput
        ref={inputBundleURL}
        style={styles.inputStyle}
        placeholder="please input bundleUrl"
        multiline={true}
        numberOfLines={4}
        defaultValue={'http://127.0.0.1:38989/index.bundle?debugUrl=ws%3A%2F%2F127.0.0.1%3A38989%2Fdebugger-proxy'}
      />
      <View style={styles.buttonContainer}>
        <View style={styles.button} onClick={openBundle}>
          <Text style={styles.buttonText} numberOfLines={1}>开始</Text>
        </View>
      </View>
    </ScrollView>
  );
}
