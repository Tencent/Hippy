import React from 'react';
import {
  WaterfallView,
  View,
  Text,
  StyleSheet
} from '@hippy/react';

const mockDataArray = [
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 }
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    collapsable: false,
  },
  itemContainer: {
    backgroundColor: '#FF0000',
    padding: 12,
  },
  separatorLine: {
    marginLeft: 12,
    marginRight: 12,
    height: 0.5,
    backgroundColor: '#e5e5e5',
  },
  loading: {
    fontSize: 11,
    color: '#aaaaaa',
    alignSelf: 'center',
  },
  pullContainer: {
    backgroundColor: 'green',
  },
  pulllContent: {
    color: 'white',
    height: 60,
    textAlign: 'center',
  }
});

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 100;

function Style1({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{ `${index}: Style 1 UI` }</Text>
    </View>
  );
}

function Style2({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{ `${index}: Style 2 UI` }</Text>
    </View>
  );
}

function Style5({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{ `${index}: Style 5 UI` }</Text>
    </View>
  );
}

export default class WaterfallViewExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: mockDataArray,
      initialListSize: 28,
      pullingText: '继续下拉触发刷新',
      fetchingDataFlag: false
    };
    this.fetchTimes = 0;
    this.getRenderRow = this.getRenderRow.bind(this);
    this.renderPullHeader = this.renderPullHeader.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.onHeaderReleased = this.onHeaderReleased.bind(this);
    this.onHeaderPulling = this.onHeaderPulling.bind(this);
  }

  /**
   * 渲染 pullHeader 组件，只保留内容即可
   */
  renderPullHeader() {
    const { pullingText } = this.state;
    return (
      <View style={styles.pullContainer}>
        <Text style={styles.pulllContent}>{ pullingText }</Text>
      </View>
    );
  }

  /**
   * 下拉超过内容高度，松手后触发
   */
  async onHeaderReleased() {
    if (this.fetchingDataFlag) {
      return;
    }
    this.setState({
      pullingText: '刷新数据中，请稍等，3秒后自动收起',
    });
    const dataSource = await this.mockFetchData();
    this.setState({ dataSource }, () => {
      // this.listView.collapsePullHeader();
      this.fetchTimes = 0;
    });
  }

  /**
   * 下拉过程中触发
   *
   * 事件会通过 contentOffset 参数返回拖拽高度，我们已经知道了内容高度，
   * 简单对比一下就可以显示不同的状态。
   *
   * 这里简单处理，其实可以做到更复杂的动态效果。
   */
  onHeaderPulling(evt) {
    if (this.fetchingDataFlag) {
      return;
    }
    if (evt.contentOffset > styles.pulllContent.height) {
      this.setState({
        pullingText: '松手，即可触发刷新',
      });
    } else {
      this.setState({
        pullingText: '继续下拉，触发刷新',
      });
    }
  }

  /**
   * 页面加载更多时触发
   *
   * 这里触发加载更多还可以使用 PullFooter 组件，主要看是否需要一个内容加载区。
   *
   * onEndReached 更适合用来无限滚动的场景。
   */
  async onEndReached() {
    const { dataSource, fetchingDataFlag } = this.state;
    // ensure that only one fetching task would be running
    if (fetchingDataFlag) return;
    this.setState({
      fetchingDataFlag: true,
      dataSource: dataSource.concat([{ style: STYLE_LOADING }]),
    });
    const newData = await this.mockFetchData();
    const lastLineItem = dataSource[dataSource.length - 1];
    if (lastLineItem && lastLineItem.style === STYLE_LOADING) {
      dataSource.pop();
    }
    const newDataSource = dataSource.concat(newData);
    this.setState({ dataSource: newDataSource });
  }

  /**
   * 获取 mock 数据
   */
  mockFetchData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setState({
          fetchingDataFlag: false,
        });
        this.fetchTimes += 1;
        if (this.fetchTimes >= MAX_FETCH_TIMES) {
          return resolve([]);
        }
        return resolve(mockDataArray);
      }, 1000);
    });
  }

  /*
   * 渲染单行文本
   */
  getRenderRow(index) {
    const { dataSource } = this.state;
    let styleUI = null;
    const rowData = dataSource[index];
    const isLastItem = dataSource.length === index + 1;
    switch (rowData.style) {
      case 1:
        styleUI = <Style1 index={index} />;
        break;
      case 2:
        styleUI = <Style2 index={index} />;
        break;
      case 5:
        styleUI = <Style5 index={index} />;
        break;
      case STYLE_LOADING:
        styleUI = <Text style={styles.loading}>Loading now...</Text>;
        break;
      default:
        // pass
    }
    return (
      <View style={styles.container}>
        <View style={styles.itemContainer}>
          {styleUI}
        </View>
        {!isLastItem ? <View style={styles.separatorLine} /> : null }
      </View>
    );
  }

  render() {
    const { dataSource } = this.state;
    return (
      <WaterfallView
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        renderRow={this.getRenderRow}
        numberOfColumns={2}
        numberOfRows={dataSource.length}
        contentInset={{ top: 0, left: 8, bottom: 0, right: 8 }}
        scrollEventThrottle={16}
        columnSpacing={10}
        interItemSpacing={16}
        seperatorStyle="None"
        preloadItemNumber={0}
        initialListSize={this.state.initialListSize}
        renderPullHeader={this.renderPullHeader}
        onEndReached={this.onEndReached}
        onHeaderReleased={this.onHeaderReleased}
        onHeaderPulling={this.onHeaderPulling}
      />
    );
  }
}