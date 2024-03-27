import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  BackAndroid,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
} from '@hippy/react';
import routes, { Type } from '../routes';
import BACK_ICON from '../shared/back-icon.png';

const styles = StyleSheet.create({
  typeContainer: {
    alignItems: 'center',
    backgroundColor: '#81D7F7',
    height: 58,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginTop: 12,
  },
  typeText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 16,
  },
  arrowIcon: {
    width: 12,
    height: 12,
    marginRight: 16,
  },
  buttonView: {
    backgroundColor: 'rgba(129, 215, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 58,
  },
  buttonText: {
    marginLeft: 16,
    fontSize: 14,
    color: '#40B6E6',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  separatorLine: {
    marginLeft: 16,
    marginRight: 16,
    height: 1,
    backgroundColor: '#81D7F7',
    opacity: 0.47,
  },
});

export class Gallery extends Component {
  constructor(props) {
    super(props);
    const typeVisibleState = {};
    Object.keys(Type).forEach((key) => {
      typeVisibleState[Type[key]] = false;
    }),
    this.state = {
      pressItem: '',
      dataSource: [...routes],
      typeVisibleState,
    };
    this.renderRow = this.renderRow.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.clickTo = this.clickTo.bind(this);
    this.clickToggle = this.clickToggle.bind(this);
  }

  componentDidMount() {
    const { history } = this.props;
    if (Platform.OS === 'android') {
      BackAndroid.addListener(() => {
        console.log('BackAndroid');
        if (history.index !== 0) {
          history.goBack();
          return true;
        }
        return false;
      });
    }
  }

  getRowType(index) {
    const { dataSource } = this.state;
    const item = dataSource[index];
    return item.meta.type;
  }

  getRowKey(index) {
    const { dataSource } = this.state;
    const item = dataSource[index];
    return item.path || `${index}`;
  }

  feedback(itemId) {
    const pressItem = itemId || '';
    this.setState({
      pressItem,
    });
  }

  clickTo(pageId) {
    const { history } = this.props;
    history.push(pageId);
  }

  clickToggle(mapType) {
    this.setState({
      typeVisibleState: {
        ...this.state.typeVisibleState,
        [mapType]: !this.state.typeVisibleState[mapType],
      },
    });
  }

  renderRow(index) {
    const { dataSource, pressItem, typeVisibleState } = this.state;
    const rowData = dataSource[index];
    const { type } = rowData.meta;
    if (type === Type.TITLE) {
      const { mapType } = rowData.meta;
      return (
        <View style={[styles.typeContainer, typeVisibleState[mapType] ? {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        } : {
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }]}
        onClick={() => this.clickToggle(mapType)}>
          <Text style={styles.typeText}>{rowData.name}</Text>
          <Image
          style={[styles.arrowIcon, typeVisibleState[mapType] ? {
            transform: [{
              rotate: '-90deg',
            }] } : {
            transform: [{
              rotate: '180deg',
            }],
          }]}
          source={{ uri: BACK_ICON }}
        />
        </View>
      );
    }
    let isLastItem = false;
    const lastItem = dataSource[index + 1];
    const lastIndex = dataSource.length - 1;
    if ((lastItem && lastItem.meta.type === Type.TITLE) || index === lastIndex) {
      isLastItem = true;
    }
    return (
     <View style={typeVisibleState[type] ? { display: 'flex' } : { display: 'none' }}>
      <View
        onPressIn={() => this.feedback(rowData.path)}
        onPressOut={() => this.feedback()}
        onClick={() => this.clickTo(rowData.path)}
        style={[styles.buttonView, {
          opacity: (pressItem === rowData.path ? 0.5 : 1),
        },
        ]}
      >
        <Text
          style={styles.buttonText}
        >
          {rowData.name}
        </Text>
      </View>
      {!isLastItem ? <View style={styles.separatorLine} /> : null}
     </View>
    );
  }

  render() {
    const { dataSource } = this.state;
    return (
      <ListView
        style={{ flex: 1 }}
        numberOfRows={dataSource.length}
        renderRow={this.renderRow}
        getRowType={this.getRowType}
        getRowKey={this.getRowKey}
        paintType="fcp"
      />
    );
  }
}

export default withRouter(Gallery);
