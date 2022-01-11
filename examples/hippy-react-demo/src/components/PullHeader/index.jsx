import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
} from '@hippy/react';
import mockData from '../../shared/UIStyles/mock';
import Style1 from '../../shared/UIStyles/Style1';
import Style2 from '../../shared/UIStyles/Style2';
import Style5 from '../../shared/UIStyles/Style5';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 50;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    padding: 12,
  },
  splitter: {
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
    height: 60,
    backgroundColor: 'green',

  },
  pullContent: {
    lineHeight: 60,
    color: 'white',
    height: 60,
    textAlign: 'center',
  },
});

/**
 * PullHeader 组件范例
 *
 * 该组件可以在列表开头增加一个下拉区域，可以轻松实现下拉加载更多、或者加载之前的内容等功能。
 * 该组件在下拉过程中通过返回 contentOffset 拖拽的距离，可以轻松做到很多种效果。
 *
 * 目前主要用于替换掉 RefreshWrapper 实现更好的下拉功能。
 */
export default class PullHeaderExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pullingText: '继续下拉触发刷新',
      loadingState: '正在加载...',
    };
    this.fetchTimes = 0;
    this.mockFetchData = this.mockFetchData.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.renderPullHeader = this.renderPullHeader.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.onHeaderReleased = this.onHeaderReleased.bind(this);
    this.onHeaderPulling = this.onHeaderPulling.bind(this);
  }

  async componentDidMount() {
    const dataSource = await this.mockFetchData();
    this.setState({ dataSource });
    // 结束时需主动调用collapsePullHeader
    this.listView.collapsePullHeader();
  }

  /**
   * 页面加载更多时触发
   *
   * 这里触发加载更多还可以使用 PullFooter 组件，主要看是否需要一个内容加载区。
   *
   * onEndReached 更适合用来无限滚动的场景。
   */
  async onEndReached() {
    const { dataSource } = this.state;
    // ensure that only one fetching task would be running
    if (this.loadMoreDataFlag) {
      return;
    }
    this.loadMoreDataFlag = true;
    this.setState({
      dataSource: dataSource.concat([{ style: STYLE_LOADING }]),
    });
    let newData = [];
    try {
      newData = await this.mockFetchData();
    } catch (err) {}
    const lastLineItem = dataSource[dataSource.length - 1];
    if (lastLineItem && lastLineItem.style === STYLE_LOADING) {
      dataSource.pop();
    }
    const newDataSource = dataSource.concat(newData);
    this.loadMoreDataFlag = false;
    this.setState({ dataSource: newDataSource });
  }

  /**
   * 下拉超过内容高度，松手后触发
   */
  async onHeaderReleased() {
    if (this.fetchingDataFlag) {
      return;
    }
    this.fetchingDataFlag = true;
    // eslint-disable-next-line no-console
    console.log('onHeaderReleased');
    this.setState({
      pullingText: '刷新数据中，请稍等，2秒后自动收起',
    });
    let dataSource = [];
    try {
      dataSource = await this.mockFetchData();
    } catch (err) {}
    this.fetchingDataFlag = false;
    this.setState({ dataSource }, () => {
      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致onHeaderReleased事件不能再次触发
      this.listView.collapsePullHeader();
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
    // eslint-disable-next-line no-console
    console.log('onHeaderPulling', evt.contentOffset);
    if (evt.contentOffset > styles.pullContent.height) {
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
   * 点击单行后触发
   *
   * @param {number} index - 被点击的索引号
   */
  // eslint-disable-next-line class-methods-use-this
  onClickItem(index, event) {
    // let target = event.target;
    // eslint-disable-next-line no-console
    console.log(`item: ${index} is clicked..`, event.target.nodeId, event.currentTarget.nodeId);
  }

  /**
   * 获取行类型，有几种界面类型的行，就返回是第几个。
   *
   * 这个事关终端层组件复用，需要谨慎设置
   *
   * @param {number} index 对应的行
   */
  getRowType(index) {
    const self = this;
    const item = self.state.dataSource[index];
    return item.style;
  }

  /**
   * 获取行 key，这个 key 是代表了数据的唯一性，用于在 React diff 时提升性能。
   *
   * 详情请见：https://reactjs.org/docs/lists-and-keys.html
   *
   * @param {number} index 对应的行
   */
  // eslint-disable-next-line class-methods-use-this
  getRowKey(index) {
    return `row-${index}`;
  }

  /**
   * 获取 mock 数据
   */
  mockFetchData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.fetchTimes += 1;
        let data = [];
        if (this.fetchTimes < MAX_FETCH_TIMES) {
          data = mockData;
        }
        return resolve(data);
      }, 600);
    });
  }

  /**
   * 渲染 pullHeader 组件，只保留内容即可
   */
  renderPullHeader() {
    const { pullingText } = this.state;
    return (
      <View style={styles.pullContainer}>
        <Text style={styles.pullContent}>{ pullingText }</Text>
      </View>
    );
  }

  /**
   * 渲染单个列表行
   *
   * @param {number} index - 行索引号
   */
  renderRow(index) {
    const { dataSource, loadingState } = this.state;
    let styleUI = null;
    const rowData = dataSource[index];
    const isLastItem = dataSource.length === index + 1;
    switch (rowData.style) {
      case 1:
        styleUI = <Style1 itemBean={rowData.itemBean} onClick={event => this.onClickItem(index, event)} />;
        break;
      case 2:
        styleUI = <Style2 itemBean={rowData.itemBean} onClick={event => this.onClickItem(index, event)} />;
        break;
      case 5:
        styleUI = <Style5 itemBean={rowData.itemBean} onClick={event => this.onClickItem(index, event)} />;
        break;
      case STYLE_LOADING:
        styleUI = <Text style={styles.loading}>{loadingState}</Text>;
        break;
      default:
        // pass
    }
    return (
      <View style={styles.container}>
        <View style={styles.itemContainer}>
          {styleUI}
        </View>
        {
          !isLastItem ? (
            <View style={styles.splitter} />
          ) : null
        }
      </View>
    );
  }

  /**
   * 渲染范例组件
   */
  render() {
    const { dataSource } = this.state;
    return (
      <ListView
         onClick={event => console.log('ListView', event.target.nodeId, event.currentTarget.nodeId)}
          ref={(ref) => {
            this.listView = ref;
          }}
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        numberOfRows={dataSource.length}
        getRowType={this.getRowType}
        getRowKey={this.getRowKey}
        renderRow={this.renderRow}
        renderPullHeader={this.renderPullHeader}
        onEndReached={this.onEndReached}
        onHeaderReleased={this.onHeaderReleased}
        onHeaderPulling={this.onHeaderPulling}
      />
    );
  }
}
