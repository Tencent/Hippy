import React from 'react';
import {
  RefreshWrapper,
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
  spliter: {
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
});

export default class RefreshWrapperExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      loadingState: '正在加载...',
    };
    this.fetchTimes = 0;
    this.mockFetchData = this.mockFetchData.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.getRefresh = this.getRefresh.bind(this);
    this.getRenderRow = this.getRenderRow.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
  }

  async componentDidMount() {
    const dataSource = await this.mockFetchData();
    this.setState({ dataSource });
  }

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


  onRefresh() {
    setTimeout(async () => {
      const dataSource = await this.mockFetchData();
      this.setState({ dataSource });
      this.refresh.refreshComplected();
    }, 1000);
  }

  // eslint-disable-next-line class-methods-use-this
  onClickItem(index) {
    // eslint-disable-next-line no-console
    console.log(`item: ${index} is clicked..`);
  }

  getRenderRow(index) {
    const { dataSource, loadingState } = this.state;
    let styleUI = null;
    const rowData = dataSource[index];
    const isLastItem = dataSource.length === index + 1;
    switch (rowData.style) {
      case 1:
        styleUI = <Style1 itemBean={rowData.itemBean} onClick={() => this.onClickItem(index)} />;
        break;
      case 2:
        styleUI = <Style2 itemBean={rowData.itemBean} onClick={() => this.onClickItem(index)} />;
        break;
      case 5:
        styleUI = <Style5 itemBean={rowData.itemBean} onClick={() => this.onClickItem(index)} />;
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
            <View style={styles.spliter} />
          ) : null
        }
      </View>
    );
  }

  getRowType(index) {
    const self = this;
    const item = self.state.dataSource[index];
    return item.style;
  }

  // eslint-disable-next-line class-methods-use-this
  getRowKey(index) {
    return `row-${index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  getRefresh() {
    return (
      <View style={{ flex: 1, height: 30 }}>
        <Text style={{ flex: 1, textAlign: 'center' }}>下拉刷新中...</Text>
      </View>
    );
  }

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
        return resolve(mockData);
      }, 1000);
    });
  }


  render() {
    const { dataSource } = this.state;
    return (
      <RefreshWrapper
        ref={(ref) => {
          this.refresh = ref;
        }}
        style={{ flex: 1 }}
        onRefresh={this.onRefresh}
        bounceTime={100}
        getRefresh={this.getRefresh}
      >
        <ListView
          style={{ flex: 1, backgroundColor: '#ffffff' }}
          numberOfRows={dataSource.length}
          renderRow={this.getRenderRow}
          onEndReached={this.onEndReached}
          getRowType={this.getRowType}
          getRowKey={this.getRowKey}
        />
      </RefreshWrapper>
    );
  }
}
