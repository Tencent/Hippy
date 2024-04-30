import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
  Platform,
} from '@hippy/react';
import mockData from '../../shared/UIStyles/mock';
import Style1 from '../../shared/UIStyles/Style1';
import Style2 from '../../shared/UIStyles/Style2';
import Style5 from '../../shared/UIStyles/Style5';

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
    flex: 1,
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
    height: 40,
    flex: 1,
    backgroundColor: '#4c9afa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * PullHeaderFooter 组件范例
 *
 * 该组件可以在列表开头增加一个下拉区域，可以轻松实现下拉加载更多、或者加载之前的内容等功能。
 * 该组件在下拉过程中通过返回 contentOffset 拖拽的距离，可以轻松做到很多种效果。
 *
 * 目前主要用于替换掉 RefreshWrapper 实现更好的下拉功能。
 */
export default class PullHeaderFooterExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      headerRefreshText: '继续下拉触发刷新',
      footerRefreshText: '正在加载...',
      horizontal: undefined,
    };
    this.loadMoreDataFlag = false;
    this.fetchingDataFlag = false;
    this.mockFetchData = this.mockFetchData.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.getHeaderStyle = this.getHeaderStyle.bind(this);
    this.getFooterStyle = this.getFooterStyle.bind(this);
    this.getRowStyle = this.getRowStyle.bind(this);
    this.renderPullHeader = this.renderPullHeader.bind(this);
    this.renderPullFooter = this.renderPullFooter.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.onHeaderReleased = this.onHeaderReleased.bind(this);
    this.onHeaderPulling = this.onHeaderPulling.bind(this);
    this.onFooterPulling = this.onFooterPulling.bind(this);
  }

  async componentDidMount() {
    const dataSource = await this.mockFetchData();
    this.setState({ dataSource });
    // 结束时需主动调用collapsePullHeader
    this.listView.collapsePullHeader();
  }

  /**
   * 获取 mock 数据
   */
  mockFetchData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData), 800);
    });
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
      dataSource = dataSource.reverse();
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
   * 点击单行后触发
   *
   * @param {number} index - 被点击的索引号
   * @param {Object} event - 事件对象
   */
  onClickItem(index, event) {
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
    const item = this.state.dataSource[index];
    return item.style;
  }

  /**
   * 获取行 key，这个 key 是代表了数据的唯一性，用于在 React diff 时提升性能。
   *
   * 详情请见：https://reactjs.org/docs/lists-and-keys.html
   *
   * @param {number} index 对应的行
   */
  getRowKey(index) {
    return `row-${index}`;
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

  getFooterStyle() {
    const { horizontal } = this.state;
    return !horizontal ? {} : {
      width: 40,
    };
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

  /**
   * 渲染单个列表行
   *
   * @param {number} index - 行索引号
   */
  renderRow(index) {
    const { dataSource } = this.state;
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
      default:
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

  // configure listItem style if horizontal listview is set
  getRowStyle() {
    const { horizontal } = this.state;
    return !horizontal ? {} : {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  changeDirection() {
    this.setState({
      horizontal: this.state.horizontal === undefined ? true : undefined,
    });
  }

  /**
   * 渲染范例组件
   */
  render() {
    const { dataSource, horizontal } = this.state;
    return (
      <View style={{ flex: 1, collapsable: false }}>
        <ListView
          horizontal={horizontal}
          onClick={event => console.log('ListView', event.target.nodeId, event.currentTarget.nodeId)}
          ref={(ref) => {
            this.listView = ref;
          }}
          style={[{ backgroundColor: '#ffffff' }, horizontal ? { height: 300 } : { flex: 1 }]}
          numberOfRows={dataSource.length}
          getRowType={this.getRowType}
          getRowKey={this.getRowKey}
          getHeaderStyle={this.getHeaderStyle}
          getFooterStyle={this.getFooterStyle}
          getRowStyle={this.getRowStyle}
          renderRow={this.renderRow}
          renderPullHeader={this.renderPullHeader}
          renderPullFooter={this.renderPullFooter}
          onHeaderReleased={this.onHeaderReleased}
          onHeaderPulling={this.onHeaderPulling}
          onFooterReleased={this.onEndReached}
          onFooterPulling={this.onFooterPulling}
          rowShouldSticky={index => (index === 0)}  // 第0行 stick
        />
        {Platform.OS === 'android'
          ? <View
            onClick={() => this.changeDirection()}
            style={{
              position: 'absolute',
              right: 20,
              bottom: 20,
              width: 67,
              height: 67,
              borderRadius: 30,
              boxShadowOpacity: 0.6,
              boxShadowRadius: 5,
              boxShadowOffsetX: 3,
              boxShadowOffsetY: 3,
              boxShadowColor: '#4c9afa' }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#4c9afa',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white' }}>切换方向</Text>
            </View>
          </View> : null}
      </View>
    );
  }
}
