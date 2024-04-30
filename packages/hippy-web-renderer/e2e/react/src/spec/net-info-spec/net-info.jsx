import React from 'react';
import {
  View,
  NetInfo,
  Text,
  NetworkModule,
} from '@hippy/react';


export class NetInfoSpec extends React.Component {
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
    globalThis.currentRef = {
      fetchUrl: () => new Promise((resolve) => {
        fetch('https://hippyjs.org', {
          mode: 'no-cors',
        }).then((responseJson) => {
          resolve({ status: responseJson.status });
        })
          .catch(() => {
            resolve({ status: null });
          });
      }),
      fetchNetInfoStatus: async () => await NetInfo.fetch(),
    };
  }

  render() {
    return (
      <View/>
    );
  }
}
