import React from 'react';
import { Text } from '@hippy/react';
import TestModule from './TestModule';

// 展示自定义Module的使用
export default class TestModuleDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hello: 'TestModule log' };
  }

  componentDidMount() {
    // 调用
    TestModule.log('hello i am from js');
    TestModule.helloNative({ hello: 'i am form js' });
    TestModule.helloNativeWithPromise({ hello: 'i am form js' }).then((e) => {
      this.setState({ hello: JSON.stringify(e) });
    });
  }

  render() {
    const { hello } = this.state;
    return (
      <Text style={{ color: 'red' }}>
        {hello}
      </Text>
    );
  }
}
