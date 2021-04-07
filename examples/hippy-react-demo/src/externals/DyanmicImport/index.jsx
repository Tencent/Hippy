import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from '@hippy/react';

const styleObj = StyleSheet.create({
  dynamicImportDemo: {
    marginTop: 20,
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'column',
  },
});

export default class DynamicImportDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      AsyncComponentFromLocal: null,
      AsyncComponentFromHttp: null,
    };

    this.onAsyncComponentLoad = this.onAsyncComponentLoad.bind(this);
  }

  onAsyncComponentLoad() {
    /* eslint-disable-next-line no-console */
    console.log('load async component');
    /**
     *  在支持动态加载的终端版本，可添加 magic comment 'webpackMode: "lazy"'，也可以不加，默认采用lazy模式;
     *
     *  在不支持动态加载的终端版本，必须显示添加 'webpackMode: "eager"'，
     *  或配置 LimitChunkCountPlugin 的 maxChunks 为 1 阻止分包;
     *
     *  目前动态加载同时支持本地和远程两种模式，参考如下：
     */

    /**
     *  本地加载参考 AsyncComponentFromLocal,
     *  webpackChunkName 可写可不写，当需要加载本地chunk时，不能配置全局 publicPath
     *  import 出错时需在catch里做对应的降级方案
     */
    import(/* webpackMode: "lazy", webpackChunkName: "asyncComponentFromLocal" */'./AsyncComponentLocal')
      .then((component) => {
        this.setState({
          AsyncComponentFromLocal: component.default || component,
        });
      })
      .catch(err => console.error('import async local component error', err));


    /**
     *  远程加载参考 AsyncComponentFromHttp，需显式指定chunk远程地址 customChunkPath，和chunk名称 webpackChunkName
     *  customChunkPath 会在运行时替换全局配置的publicPath
     *  import 出错时需在catch里做对应的降级方案
     */
    import(/* webpackMode: "lazy",customChunkPath: "https://static.res.qq.com/hippy/hippyReactDemo/", webpackChunkName: "asyncComponentFromHttp" */'./AsyncComponentHttp')
      .then((component) => {
        this.setState({
          AsyncComponentFromHttp: component.default || component,
        });
      })
      .catch(err => console.error('import async remote component error', err));
  }

  render() {
    const { AsyncComponentFromLocal, AsyncComponentFromHttp } = this.state;
    return (
      <View style={styleObj.dynamicImportDemo}>
        <View style={{
          width: 130,
          height: 40,
          textAlign: 'center',
          backgroundColor: '#4c9afa',
          borderRadius: 5,
        }} onTouchDown={this.onAsyncComponentLoad}
        >
          <Text style={{
            height: 40,
            lineHeight: 40,
            textAlign: 'center',
          }} >
            点我异步加载
          </Text>
        </View>
        <View style={{
          marginTop: 20,
        }}>
          {AsyncComponentFromLocal ? <AsyncComponentFromLocal /> : null}
          {AsyncComponentFromHttp ? <AsyncComponentFromHttp /> : null}
        </View>
      </View>
    );
  }
}
