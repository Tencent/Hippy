import React from 'react';
import {
  WaterfallView,
  View,
  StyleSheet,
  Text,
  Dimensions,
} from '@hippy/react';

import mockDataTemp from '../../shared/UIStyles/mock';
import Style1 from '../../shared/UIStyles/Style1';
import Style2 from '../../shared/UIStyles/Style2';
import Style5 from '../../shared/UIStyles/Style5';
const mockData = mockDataTemp.filter(item => item.style !== 2);
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
    height: 50,
    backgroundColor: '#4c9afa',
  },
  pullContent: {
    lineHeight: 50,
    color: 'white',
    height: 50,
    textAlign: 'center',
  },
  pullFooter: {
    flex: 1,
    height: 40,
    backgroundColor: '#4c9afa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class ListExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      headerRefreshText: '继续下拉触发刷新',
      footerRefreshText: '正在加载...',
      horizontal: undefined,
    };
    this.numberOfColumns = 2;
    this.columnSpacing = 6;
    this.interItemSpacing = 6;
    this.mockFetchData = this.mockFetchData.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.getItemType = this.getItemType.bind(this);
    this.getItemKey = this.getItemKey.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.getRefresh = this.getRefresh.bind(this);
    this.renderPullFooter = this.renderPullFooter.bind(this);
    this.renderPullHeader = this.renderPullHeader.bind(this);
    this.onHeaderReleased = this.onHeaderReleased.bind(this);
    this.onHeaderPulling = this.onHeaderPulling.bind(this);
    this.onFooterPulling = this.onFooterPulling.bind(this);
    this.renderBanner = this.renderBanner.bind(this);
    this.getItemStyle = this.getItemStyle.bind(this);
    this.getHeaderStyle = this.getHeaderStyle.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  async componentDidMount() {
    const dataSource = await this.mockFetchData();
    this.setState({ dataSource });
  }

  /**
   * 页面加载更多时触发
   *
   * 这里触发加载更多还可以使用 PullFooter 组件。
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
      footerRefreshText: '加载更多...',
    });
    let newData = [];
    try {
      newData = await this.mockFetchData();
    } catch (err) {}
    if (newData.length === 0) {
      this.setState({
        footerRefreshText: '没有更多数据',
      });
    }
    const newDataSource = [...dataSource, ...newData];
    this.setState({ dataSource: newDataSource });
    this.loadMoreDataFlag = false;
    this.listView.collapsePullFooter();
  }

  /**
   * 下拉超过内容高度，松手后触发
   */
  async onHeaderReleased() {
    if (this.fetchingDataFlag) {
      return;
    }
    this.fetchingDataFlag = true;
    console.log('onHeaderReleased');
    this.setState({
      headerRefreshText: '刷新数据中，请稍等',
    });
    let dataSource = [];
    try {
      dataSource = await this.mockFetchData();
    } catch (err) {}
    this.fetchingDataFlag = false;
    this.setState({
      dataSource,
      headerRefreshText: '2秒后收起',
    }, () => {
      this.listView.collapsePullHeader({ time: 2000 });
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
    console.log('onHeaderPulling', evt.contentOffset);
    if (evt.contentOffset > styles.pullContent.height) {
      this.setState({
        headerRefreshText: '松手，即可触发刷新',
      });
    } else {
      this.setState({
        headerRefreshText: '继续下拉，触发刷新',
      });
    }
  }

  onFooterPulling(evt) {
    console.log('onFooterPulling', evt);
  }

  /**
   * 渲染 pullFooter 组件
   */
  renderPullFooter() {
    const { horizontal } = this.state;
    return !horizontal ? <View style={styles.pullFooter}>
      <Text style={{
        color: 'white',
      }}
      >{this.state.footerRefreshText}</Text>
    </View> : <View style={{
      width: 40,
      height: 300,
      backgroundColor: '#4c9afa',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        color: 'white',
        lineHeight: 25,
        width: 40,
        paddingHorizontal: 15,
      }}
      >{this.state.footerRefreshText}</Text>
    </View>;
  }

  async onRefresh() {
    setTimeout(async () => {
      const dataSource = await this.mockFetchData();
      this.setState({ dataSource });
      this.refresh.refreshComplected();
    }, 1000);
  }

  getRefresh() {
    return (
        <View style={{ flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4c9afa' }}>
          <Text style={{ height: 40, lineHeight: 40, textAlign: 'center', color: 'white' }}>下拉刷新中...</Text>
        </View>
    );
  }

  /**
   * 点击单行后触发
   *
   * @param {number} index - 被点击的索引号
   */
  onClickItem(index) {
    console.log(`item: ${index} is clicked..`);
  }

  getItemType(index) {
    const item = this.state.dataSource[index];
    return item.style;
  }

  getItemKey(index) {
    return `row-${index}`;
  }

  onItemClick(index) {
    console.log('onItemClick', index);
    this.listView.scrollToIndex({ index, animation: true });
  }

  onScroll(obj) {

  }

  // render banner(it is not supported on Android yet)
  renderBanner() {
    if (this.state.dataSource.length === 0) return null;
    return (<View style={{
      backgroundColor: 'grey',
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        fontSize: 20,
        color: 'white',
        lineHeight: 100,
        height: 100,
      }}>Banner View</Text>
    </View>);
  }

  renderItem(index) {
    const { dataSource } = this.state;
    let styleUI = null;
    const rowData = dataSource[index];
    switch (rowData.style) {
      case 1:
        styleUI = <Style1 itemBean={rowData.itemBean} />;
        break;
      case 2:
        styleUI = <Style2 itemBean={rowData.itemBean} />;
        break;
      case 5:
        styleUI = <Style5 itemBean={rowData.itemBean} />;
        break;
      default:
    }
    return (
        <View
            onClick={() => this.onItemClick(index)}
            style={styles.container}
        >
          <View style={styles.itemContainer}>
            {styleUI}
          </View>
          <View style={styles.splitter} />
        </View>
    );
  }

  /**
   * 获取 mock 数据
   */
  mockFetchData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = [...mockData, ...mockData];
        return resolve(data);
      }, 600);
    });
  }

  getWaterfallContentInset() {
    return { top: 0, left: 0, bottom: 0, right: 0 };
  }

  getItemStyle() {
    const { numberOfColumns, columnSpacing } = this;
    const screenWidth = Dimensions.get('screen').width - 32;
    const contentInset = this.getWaterfallContentInset();
    const width = screenWidth - contentInset.left - contentInset.right;
    return {
      width: (width - ((numberOfColumns - 1) * columnSpacing)) / numberOfColumns,
    };
  }

  getHeaderStyle() {
    const { horizontal } = this.state;
    return !horizontal ? {} : {
      width: 50,
    };
  }

  /**
   * 渲染 pullHeader 组件
   */
  renderPullHeader() {
    const { headerRefreshText, horizontal } = this.state;
    return (
      !horizontal ? <View style={styles.pullContainer}>
        <Text style={styles.pullContent}>{headerRefreshText}</Text>
      </View> : <View style={{
        width: 40,
        height: 300,
        backgroundColor: '#4c9afa',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          lineHeight: 25,
          color: 'white',
          width: 40,
          paddingHorizontal: 15,
        }}>{headerRefreshText}</Text>
      </View>
    );
  }

  render() {
    const { dataSource } = this.state;
    const { numberOfColumns, columnSpacing, interItemSpacing } = this;
    const contentInset = this.getWaterfallContentInset();
    return (
          <WaterfallView
              ref={(ref) => {
                this.listView = ref;
              }}
              numberOfColumns={numberOfColumns}
              columnSpacing={columnSpacing}
              interItemSpacing={interItemSpacing}
              numberOfItems={dataSource.length}
              preloadItemNumber={4}
              style={{ flex: 1 }}
              onScroll={this.onScroll}
              renderBanner={this.renderBanner}
              renderPullHeader={this.renderPullHeader}
              onEndReached={this.onEndReached}
              onFooterReleased={this.onEndReached}
              onHeaderReleased={this.onHeaderReleased}
              onHeaderPulling={this.onHeaderPulling}
              renderItem={this.renderItem}
              getItemType={this.getItemType}
              getItemKey={this.getItemKey}
              getItemStyle={this.getItemStyle}
              getHeaderStyle={this.getHeaderStyle}
              contentInset={contentInset}
          />
    );
  }
}
