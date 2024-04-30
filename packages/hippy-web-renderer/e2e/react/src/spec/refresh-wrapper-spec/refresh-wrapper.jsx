import React from 'react';
import {
  RefreshWrapper,
  ListView,
  View,
  StyleSheet,
  Text,
} from '@hippy/react';

const STYLE_LOADING = 100;

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
];
function Style2({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{ `${index}: Style 2 UI` }</Text>
    </View>
  );
}
export class RefreshWrapperSpec extends React.Component {
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


  componentWillMount() {
    globalThis.currentRef = {
      startRefresh: () => {
        this.refresh.startRefresh();
      },
    };
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
      this.refresh.refreshCompleted();
    }, 2000);
  }

  onClickItem(index) {
    console.log(`item: ${index} is clicked..`);
  }

  getRenderRow(index) {
    const { dataSource, loadingState } = this.state;
    let styleUI = null;
    const rowData = dataSource[index];
    const isLastItem = dataSource.length === index + 1;
    switch (rowData.style) {
      case 1:

      case 2:
      case 5:
        styleUI = <Style2 itemBean={rowData.itemBean} onClick={() => this.onClickItem(index)} />;
        break;
      case STYLE_LOADING:
        styleUI = <Text style={styles.loading}>{loadingState}</Text>;
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

  getRowKey(index) {
    return `row-${index}`;
  }

  getRefresh() {
    return (
      <View style={{ flex: 1, height: 30 }}>
        <Text style={{ flex: 1, textAlign: 'center' }}>下拉刷新中...</Text>
      </View>
    );
  }

  mockFetchData() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDataArray), 600);
    });
  }


  render() {
    const { dataSource } = this.state;
    return (
      <RefreshWrapper
        ref={(ref) => {
          this.refresh = ref;
          console.log('get ref', ref);
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
