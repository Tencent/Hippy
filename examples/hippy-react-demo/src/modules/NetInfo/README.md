### Fetch & NetInfo

1. **简介** 

    fetch和NetInfo模块是Hippy提供的Native能力之一

2. **代码示例**

```js

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  NetInfo,
  Text,
  NetworkModule,
} from '@hippy/react';

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: '#242424',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default class NetInfoExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoText: '正在获取..',
    };
    this.listener = null;
  }

  async componentWillMount() {
    const self = this;
    const netInfo = await NetInfo.fetch();
    this.setState({
      infoText: netInfo,
    });
    this.listener = NetInfo.addEventListener('change', (info) => {
      self.setState({
        infoText: `收到通知: ${info.network_info}`,
      });
    });
  }

  componentDidMount() {
    const self = this;
    if (this.listener) {
      NetInfo.removeEventListener('change', this.listener);
    }

    fetch('https://m.baidu.com').then((responseJson) => {
      // eslint-disable-next-line no-console
      console.log('接收成功', responseJson);
      self.setState({
        infoText: `成功: ${responseJson.body}`,
      });
      return responseJson;
    }).catch((error) => {
      self.setState({
        infoText: `收到错误: ${error}`,
      });
      // eslint-disable-next-line no-console
      console.error('接收错误', error);
    });

    /**
     * hippy sdk 1.3.0+ setCookie 设置指定url下的Cookie
     * @param url 指定url，其实也就是指定作用域，如：http://3g.qq.com
     * @param keyValue cookie key-value键值对集合，多个以分号";"隔开，如：name=harryguo。或者：name=harryguo;gender=male
     * @param expires 默认为空 过期时间，格式与http协议头response里的Set-Cookie相同，如：Thu, 08-Jan-2020 00:00:00 GMT
     * 注意：指定expires的时候，只能设置一个cookie；如果不指定expires的时候，可以设置多个cookie：name=harryguo;gender=male
     */
    // setCookie("http://3g.qq.com", "name=harryguo", "Thu, 08-Jan-2020 00:00:00 GMT");
    NetworkModule.setCookie('http://3gxx.qq.com', 'name=harryguo;gender=male');

    /**
     * hippy sdk 1.3.0+ getCookie 获取指定url下的所有cookie
     * @param url 指定url，其实也就是指定作用域，如：http://3g.qq.com
     * @return 指定url下的所有cookie，如：eqid=deleted;bd_traffictrace=012146;BDSVRTM=418
     */
    NetworkModule.getCookies('http://3gxx.qq.com').then((cookie) => {
      // eslint-disable-next-line no-console
      console.log(`cookie: ${cookie}`);
    });
  }

  render() {
    const { infoText } = this.state;
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.text}>{infoText}</Text>
      </ScrollView>
    );
  }
}


```

