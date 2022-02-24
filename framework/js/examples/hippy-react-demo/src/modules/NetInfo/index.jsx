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

    fetch('https://hippyjs.org', {
      headers: {
        Refer: 'https://hippyjs.org',
        Cookie: ['hippy=cookieTest1', 'hippy=cookieTest2'],
      },
    }).then((responseJson) => {
      console.log('成功', responseJson);
      self.setState({
        infoText: `成功: ${responseJson.body}`,
      });
      return responseJson;
    })
      .catch((error) => {
        self.setState({
          infoText: `收到错误: ${error}`,
        });
        console.error('收到错误:', error);
      });

    /**
     * hippy 设置指定url下的Cookie
     * @param url指定网址，如：https://hippyjs.org
     * @param keyValue cookie key-value键值对集合，多个以分号";"隔开，如：name=someone。或者：name=someone;gender=male
     * @param expires 默认为空 过期时间，格式与http协议头response里的Set-Cookie相同，如：Thu, 08-Jan-2020 00:00:00 GMT
     * 注意：指定expires的时候，只能设置一个cookie；如果不指定expires的时候，可以设置多个cookie：name=someone;gender=male
     */
    NetworkModule.setCookie('https://hippyjs.org', 'name=someone;gender=male');

    /**
     * hippy 获取指定url下的所有cookie
     * @param url指定网址，如：https://hippyjs.org
     * @return 指定url下的所有cookie，如：eqid=deleted;bd_traffictrace=012146;BDSVRTM=418
     */
    NetworkModule.getCookies('https://hippyjs.org').then((cookie) => {
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
