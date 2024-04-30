import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  WebView,
} from '@hippy/react';

const styles = StyleSheet.create({
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  webViewStyle: {
    padding: 10,
    flex: 1,
    flexGrow: 1,
    borderRadius: 10,
  },
});

export default function WebViewExample() {
  return (
    <View style={{ paddingHorizontal: 10,  flex: 1 }}>
      <View style={styles.itemTitle}>
        <Text>WebView 示例</Text>
      </View>
      <WebView
        source={{
          uri: 'https://hippyjs.org',
        }}
        method={'get'}
        userAgent={'Mozilla/5.0 (Linux; U; Android 5.1.1; '
        + 'zh-cn; vivo X7 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 Chrome/37.0.0.0 MQQBrowser/8.2 '
        + 'Mobile Safari/537.36'}
        style={styles.webViewStyle}
        onLoad={({ url }) => console.log('webview onload', url)}
        onLoadStart={({ url }) => console.log('webview onLoadStart', url)}
        onLoadEnd={({ url, success, error }) => console.log('webview onLoadEnd', url, success, error)}
      />
    </View>
  );
}
