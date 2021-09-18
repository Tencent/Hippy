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
    height: 0.5,
    backgroundColor: '#e5e5e5',
  },
  loading: {
    fontSize: 11,
    color: '#aaaaaa',
    alignSelf: 'center',
  },
});


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

export default class ListExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: mockDataArray,
      fetchingDataFlag: false,
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
  // eslint-disable-next-line class-methods-use-this
  onAppear(index) {
    // eslint-disable-next-line no-console
    console.log('onAppear', index);
  }

  // item完全隐藏
  // eslint-disable-next-line class-methods-use-this
  onDisappear(index) {
    // eslint-disable-next-line no-console
    console.log('onDisappear', index);
  }

  // TODO android onWillAppear不完善，暂时不适用
  // item至少一个像素曝光
  // eslint-disable-next-line class-methods-use-this
  onWillAppear(index) {
    // eslint-disable-next-line no-console
    console.log('onWillAppear', index);
  }

  // TODO android onWillDisappear不完善，暂时不适用
  // item至少一个像素隐藏
  // eslint-disable-next-line class-methods-use-this
  onWillDisappear(index) {
    // eslint-disable-next-line no-console
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

  /* eslint-disable-next-line class-methods-use-this */
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
      <View style={styles.container}>
        <View style={styles.itemContainer}>
          {styleUI}
        </View>
        {!isLastItem ? <View style={styles.separatorLine} /> : null }
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
      }, 1000);
    });
  }

  render() {
    const { dataSource } = this.state;
    return (
      <ListView
        bounces={true}
        overScrollEnabled={true}
        horizontal={undefined} // horizontal ListView  flag（only Android support）
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        numberOfRows={dataSource.length}
        renderRow={this.getRenderRow}
        onEndReached={this.onEndReached}
        getRowType={this.getRowType}
        onDelete={this.onDelete}
        delText={this.delText}
        editable={true}
        // getRowStyle={this.getRowStyle}
        getRowKey={this.getRowKey}
        initialListSize={15}
        rowShouldSticky={index => index === 2}
        onAppear={index => this.onAppear(index)}
        onDisappear={index => this.onDisappear(index)}
        onWillAppear={index => this.onWillAppear(index)}
        onWillDisappear={index => this.onWillDisappear(index)}
      />
    );
  }
}

