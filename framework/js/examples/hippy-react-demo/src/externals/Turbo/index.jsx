import React from 'react';
import { View, Text, ListView, StyleSheet } from '@hippy/react';
import {
  getString,
  getNum,
  getBoolean,
  getMap,
  getObject,
  getTurboConfig,
  printTurboConfig,
  nativeWithPromise,
  getArray,
} from './demoTurbo';

const turboStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cellContentView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ccc',
    marginBottom: 1,
  },
  funcInfo: {
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  actionButton: {
    backgroundColor: '#4c9afa',
    color: '#fff',
    height: 44,
    lineHeight: 44,
    textAlign: 'center',
    width: 80,
    borderRadius: 6,
  },
  resultView: {
    backgroundColor: 'darkseagreen',
    minHeight: 150,
    padding: 15,
  },
});


export default class TurboDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      result: '',
      funList: [
        'getString',
        'getNum',
        'getBoolean',
        'getMap',
        'getObject',
        'getArray',
        'nativeWithPromise',
        'getTurboConfig',
        'printTurboConfig',
        'getInfo',
        'setInfo',
      ],
    };
    this.onTurboFunc = this.onTurboFunc.bind(this);
    this.getRenderRow = this.getRenderRow.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
  }

  async onTurboFunc(funcName) {
    let result;
    if (funcName === 'nativeWithPromise') {
      result = await nativeWithPromise('aaa');
    } else if (funcName === 'getTurboConfig') {
      this.config = getTurboConfig();
      result = '获取到config对象';
    } else if (funcName === 'printTurboConfig') {
      result = printTurboConfig(this.config);
    } else if (funcName === 'getInfo') {
      result = this.config.getInfo();
    } else if (funcName === 'setInfo') {
      this.config.setInfo('Hello World');
      result = '设置config信息成功';
    } else {
      const basicFuncs = {
        getString: () => getString('123'),
        getNum: () => getNum(1024),
        getBoolean: () => getBoolean(true),
        getMap: () => getMap(new Map([['a', '1'], ['b', 2]])),
        getObject: () => getObject({ c: '3', d: '4' }),
        getArray: () => getArray(['a', 'b', 'c']),
      };
      result = basicFuncs[funcName]();
    }
    this.setState({ result });
  }


  renderResultView() {
    return (
      <View style={turboStyles.resultView}>
        <Text style={{ backgroundColor: 'darkseagreen' }}>{`${this.state.result}`}</Text>
      </View>
    );
  }

  getRenderRow(index) {
    const { funList } = this.state;
    return (
      <View style={turboStyles.cellContentView}>
        <View style={turboStyles.funcInfo}>
          <Text numberofLines={0}>函数名：{funList[index]}</Text>
        </View>
        <Text style={turboStyles.actionButton} onClick={() => this.onTurboFunc(funList[index])}>执行</Text>
      </View>
    );
  }

  getRowKey(index) {
    const { funList } = this.state;
    return funList[index];
  }

  render() {
    const { funList } = this.state;
    return (
      <View style={turboStyles.container}>
        {this.renderResultView()}
        <ListView
          numberOfRows={funList.length}
          renderRow={this.getRenderRow}
          getRowKey={this.getRowKey}
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}
