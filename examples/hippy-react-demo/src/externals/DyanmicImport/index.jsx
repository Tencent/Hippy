import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from '@hippy/react';

const styleObj = StyleSheet.create({
  dynamicImportDemo: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
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
    import(/* webpackMode: "lazy" */ './AsyncComponent').then((component) => {
      this.setState({
        AsyncComponent: component.default ? component.default : component,
      });
    });
  }

  render() {
    const { AsyncComponent } = this.state;
    return (
      <View style={styleObj.dynamicImportDemo}>
        <Text onTouchDown={this.onAsyncComponentLoad}>
          点我异步加载
        </Text>
        {AsyncComponent && <AsyncComponent />}
      </View>
    );
  }
}
