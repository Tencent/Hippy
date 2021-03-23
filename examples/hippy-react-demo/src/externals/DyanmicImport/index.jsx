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

// 使用自定义的View
export default class DynamicImportDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      AsyncComponent: null,
    };

    this.onAsyncComponentLoad = this.onAsyncComponentLoad.bind(this);
  }

  componentDidMount() {}

  onAsyncComponentLoad() {
    /* eslint-disable-next-line no-console */
    console.log('load async component');
    // 在已经支持动态加载的终端版本，可以加 /* webpackMode: "lazy" */ 注释也可以不加，默认就是lazy模式；
    // 在不支持动态加载的终端版本，可以添加 /* webpackMode: "eager" */ 不进行分包
    import('./AsyncComponent').then((component) => {
      this.setState({
        AsyncComponent: component.default ? component.default : component,
      });
    });
  }

  render() {
    const { AsyncComponent } = this.state;
    return (
      <View style={styleObj.dynamicImportDemo}>
        <Text style={{
          width: 130,
          height: 40,
          textAlign: 'center',
          backgroundColor: '#4c9afa',
          borderRadius: 5,
        }} onTouchDown={this.onAsyncComponentLoad}>
          点我异步加载
        </Text>
        <View style={{
          marginTop: 20,
        }}>
          {AsyncComponent && <AsyncComponent />}
        </View>
      </View>
    );
  }
}
