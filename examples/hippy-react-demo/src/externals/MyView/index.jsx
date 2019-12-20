import React from 'react';
import { Text } from 'hippy-react';
import MyView from './MyView';

// 使用自定义的View
export default class MyViewDemo extends React.Component {
  componentDidMount() {
    const self = this;
    // 调用控件扩展的方法，不过一般不这么做都是扩展在属性里面
    setTimeout(() => {
      self.refs.myview.changeColor('#0055f0');
    }, 1000);
  }

  render() {
    return (
      <MyView
        ref={(ref) => { this.myview = ref; }}
        text="你好，我是MyView"
        style={{ width: 250, height: 100, color: 'black' }}
      >
        <Text style={{
          marginTop: 2,
          marginLeft: 2,
          fontSize: 16,
          color: '#4c0afa',
        }}
        >
          内部子View的文字
        </Text>
      </MyView>
    );
  }
}
