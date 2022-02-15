import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
} from '@hippy/react';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 100;
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    collapsable: false,
  },
  itemContainer: {
    padding: 12,
  },
  separatorLine: {
    marginLeft: 12,
    marginRight: 12,
    height: 1,
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


function Style1({ index }) {
  return (
    <View style={styles.container}
      onClickCapture={(event) => {
        console.log('onClickCapture style1', event.target.nodeId, event.currentTarget.nodeId);
      }}
      onTouchDown={(event) => {
        // if stopPropagation && return false called at the same time, stopPropagation has higher priority
        event.stopPropagation();
        console.log('onTouchDown style1', event.target.nodeId, event.currentTarget.nodeId);
        return false;
      }}
      onClick={(event) => {
        console.log('click style1', event.target.nodeId, event.currentTarget.nodeId);
        return false;
      }}
    >
      <Text numberOfLines={1}>{`${index}: Style 1 UI`}</Text>
    </View>
  );
}

function Style2({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{`${index}: Style 2 UI`}</Text>
    </View>
  );
}

function Style5({ index }) {
  return (
    <View style={styles.container}>
      <Text numberOfLines={1}>{`${index}: Style 5 UI`}</Text>
    </View>
  );
}

export default class ListExample extends React.Component {
  constructor(props) {
    super(props);
    this.pullingText = {
      pull: '继续下拉触发刷新',
      release: '松手，即可触发刷新',
      loading: '刷新数据中，请稍等，1秒后自动收起',
    };
    this.state = {
      dataSource: mockDataArray,
      fetchingDataFlag: false,
      pullingText: this.pullingText.pull,
    };
    this.fetchTimes = 0;
    this.delText = 'Delete';
    this.mockFetchData = this.mockFetchData.bind(this);
    this.getRenderRow = this.getRenderRow.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.getRowStyle = this.getRowStyle.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onAppear = this.onAppear.bind(this);
    this.onDisappear = this.onDisappear.bind(this);
    this.onWillAppear = this.onWillAppear.bind(this);
    this.onWillDisappear = this.onWillDisappear.bind(this);
    this.rowShouldSticky = this.rowShouldSticky.bind(this);
    this.listRef = React.createRef(null);
  }

  onDelete({ index }) {
    const { dataSource } = this.state;
    const newData = dataSource.filter((item, i) => index !== i);
    this.setState({
      dataSource: newData,
    });
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
  // item完全曝光
  onAppear(index) {
    console.log('onAppear', index);
  }
  // item完全隐藏
  onDisappear(index) {
    console.log('onDisappear', index);
  }
  // item至少一个像素曝光
  onWillAppear(index) {
    console.log('onWillAppear', index);
  }
  // item至少一个像素隐藏
  onWillDisappear(index) {
    console.log('onWillDisappear', index);
  }
  getRowType(index) {
    const self = this;
    const item = self.state.dataSource[index];
    return item.style;
  }
  // configure listItem style if horizontal listview is set
  getRowStyle() {
    return {
      width: 100,
      height: 50,
    };
  }

  getRowKey(index) {
    return `row-${index}`;
  }

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
      <View style={styles.container}
        onClickCapture={(event) => {
          console.log('onClickCapture style outer', event, event.target.nodeId, event.currentTarget.nodeId);
        }}
        onTouchDown={(event) => {
          // outer onTouchDown would not be called, because style1 invoked event.stopPropagation();
          console.log('onTouchDown style outer', event.target.nodeId, event.currentTarget.nodeId);
          return false;
        }}
        onClick={(event) => {
          console.log('click style outer', event.target.nodeId, event.currentTarget.nodeId);
          // return false means trigger bubble
          return false;
        }}>
        <View style={styles.itemContainer}>
          {styleUI}
        </View>
        {!isLastItem ? <View style={styles.separatorLine} /> : null}
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
        return resolve(mockDataArray);
      }, 600);
    });
  }

  rowShouldSticky(rowIndex) {
    return [10, 20, 30].includes(rowIndex);
  }


  render() {
    const { dataSource } = this.state;
    return (
      <ListView
        onTouchDown={(event) => {
          console.log('onTouchDown ListView', event.target.nodeId, event.currentTarget.nodeId);
        }}
        onClickCapture={(event) => {
          // if calling capture event stopPropagation function in one of node,
          // all capture phase left, target phase and bubbling phase would stop.
          // event.stopPropagation();
          console.log('onClickCapture listview', event.target.nodeId, event.currentTarget.nodeId);
        }}
        onClick={(event) => {
          console.log('click listview', event.target.nodeId, event.currentTarget.nodeId);
          // return false means trigger bubble
          return true;
        }}
        bounces={true}
        scrollEnabled={true}
        showScrollIndicator={false}
        overScrollEnabled={true}
        // horizontal ListView  flag（only Android support）
        horizontal={undefined}
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        numberOfRows={dataSource.length}
        renderRow={this.getRenderRow}
        onEndReached={this.onEndReached}
        getRowType={this.getRowType}
        onDelete={this.onDelete}
        delText={this.delText}
        editable={true}
        // configure listItem style if horizontal listview is set
        // getRowStyle={this.getRowStyle}
        getRowKey={this.getRowKey}
        rowShouldSticky={this.rowShouldSticky}
        initialListSize={15}
        onAppear={this.onAppear}
        onDisappear={this.onDisappear}
        onWillAppear={this.onWillAppear}
        onWillDisappear={this.onWillDisappear}
      />
    );
  }
}
