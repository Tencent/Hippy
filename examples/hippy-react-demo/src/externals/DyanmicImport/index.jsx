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
