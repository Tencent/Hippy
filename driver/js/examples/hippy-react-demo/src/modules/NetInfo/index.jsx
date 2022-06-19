import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  NetInfo,
  Text,
  NetworkModule,
} from '@hippy/react';

const styles = StyleSheet.create({
  itemTitle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
    padding: 10,
    marginTop: 10,
  },
  wrapper: {
    borderColor: '#eee',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  infoText: {
    collapsable: false,
    marginVertical: 5,
  },
});

export default class NetInfoExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      netInfoStatusTxt: '',
      netInfoChangeTxt: '',
      fetchInfoTxt: '',
      cookies: '',
    };
    this.listener = null;
  }

  async fetchNetInfoStatus() {
    this.setState({
      netInfoStatusTxt: await NetInfo.fetch(),
    });
  }

  fetchUrl() {
    fetch('https://hippyjs.org', {
      mode: 'no-cors', // 2.14.0 or above supports other options(not only method/headers/url/body)
    }).then((responseJson) => {
      this.setState({
        fetchInfoTxt: `成功状态: ${responseJson.status}`,
      });
      return responseJson;
    })
      .catch((error) => {
        this.setState({
          fetchInfoTxt: `收到错误: ${error}`,
        });
      });
  }

  setCookies() {
    /**
     * hippy 设置指定url下的Cookie
     * @param {string} url指定网址，如：https://hippyjs.org
     * @param {string} keyValue cookie key-value键值对集合，多个以分号";"隔开，如：name=hippy。或者：name=hippy;network=mobile
     * @param {Date} expires 过期时间，默认为空，格式与http协议头response里的Set-Cookie相同，如：Thu, 08-Jan-2020 00:00:00 GMT
     * 注意：指定 expires 的时候，只能设置一个cookie；如果不指定expires的时候，可以设置多个cookie：name=hippy;network=mobile
     */
    NetworkModule.setCookie('https://hippyjs.org', 'name=hippy;network=mobile');
  }

  getCookies() {
    /**
     * hippy 获取指定 url 下的所有 cookies
     * @param url指定网址，如：https://hippyjs.org
     * @return 返回url下的所有cookies，如：name=hippy;network=mobile
     */
    NetworkModule.getCookies('https://hippyjs.org').then((cookies) => {
      this.setState({
        cookies,
      });
    });
  }

  async componentWillMount() {
    const self = this;
    this.listener = NetInfo.addEventListener('change', (info) => {
      self.setState({
        netInfoChangeTxt: `${info.network_info}`,
      });
    });
  }

  componentWillUnmount() {
    if (this.listener) {
      NetInfo.removeEventListener('change', this.listener);
    }
  }

  componentDidMount() {
    this.fetchUrl();
    this.fetchNetInfoStatus();
  }

  render() {
    const { netInfoStatusTxt, fetchInfoTxt, netInfoChangeTxt, cookies } = this.state;
    const renderTitle = title => (
      <View style={styles.itemTitle}>
        <Text>{title}</Text>
      </View>
    );
    return (
      <ScrollView style={{ padding: 10 }}>
        {renderTitle('Fetch')}
        <View style={[styles.wrapper]}
        >
          <View style={[styles.infoContainer]}>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.fetchUrl()}>
              <Text style={{ color: 'white' }}>请求 hippy 网址:</Text>
            </View>
            <Text style={styles.infoText}>{fetchInfoTxt}</Text>
          </View>
        </View>
        {renderTitle('NetInfo')}
        <View style={[styles.wrapper]}
        >
          <View style={[styles.infoContainer]}>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.fetchNetInfoStatus()}>
              <Text style={{ color: 'white' }}>获取网络状态:</Text>
            </View>
            <Text style={styles.infoText}>{netInfoStatusTxt}</Text>
          </View>
          <View style={[styles.infoContainer]}>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }}>
              <Text style={{ color: 'white' }}>监听网络变化:</Text>
            </View>
            <Text style={styles.infoText}>{netInfoChangeTxt}</Text>
          </View>
        </View>
        {renderTitle('NetworkModule')}
        <View style={[styles.wrapper]}
        >
          <View style={[styles.infoContainer]}>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.setCookies()}>
              <Text style={{ color: 'white' }}>设置Cookies：</Text>
            </View>
            <Text style={styles.infoText}>name=hippy;network=mobile</Text>
          </View>
          <View style={[styles.infoContainer]}>
            <View style={{ backgroundColor: 'grey', padding: 10, borderRadius: 10, marginRight: 10 }} onClick={() => this.getCookies()}>
              <Text style={{ color: 'white' }}>获取Cookies：</Text>
            </View>
            <Text style={styles.infoText}>{cookies}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
