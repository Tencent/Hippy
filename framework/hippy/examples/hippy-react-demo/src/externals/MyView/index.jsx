import React from 'react';
import { Text } from '@hippy/react';
import MyView from './MyView';

// 使用自定义的View
export default class MyViewDemo extends React.Component {
  componentDidMount() {
    // 调用控件扩展的方法，不过一般不这么做都是扩展在属性里面
    setTimeout(() => {
      this.myview.changeColor('#0055f0');
    }, 1000);
  }

  render() {
    // 要注意，Hippy 终端只支持加载 Unicode 编码的代码，所以代码都通过 unicode-loader 转换了一次编码。
    // 所以中文如果直接写到 props 会变成 \uxxxx 的乱码。
    // 有两个办法：
    // 1. 将中文写成单独变量。
    // 2. 加载时通过 [unicodeToChar](https://github.com/Tencent/Hippy/blob/master/packages/hippy-react/src/components/text.tsx#L84) 转一下
    const text = '你好，我是MyView';
    return (
      <MyView
        ref={(ref) => {
          this.myview = ref;
        }}
        text={text}
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
