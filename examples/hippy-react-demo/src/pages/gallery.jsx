import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  BackAndroid,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';
import routes from '../routes';

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#f44837',
  textWhite: '#fff',
};


const styles = StyleSheet.create({
  rowContainer: {
    alignItems: 'center',
  },
  buttonView: {
    borderColor: SKIN_COLOR.mainLight,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 50,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 20,
    color: SKIN_COLOR.mainLight,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressItem: '',
      dataSource: [...routes],
    };
    this.renderRow = this.renderRow.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.clickTo = this.clickTo.bind(this);
  }

  componentDidMount() {
    const { history } = this.props;
    if (Platform.OS === 'android') {
      BackAndroid.addListener(() => {
        if (history.index === 0) {
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
    return item.meta.style;
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

  renderRow(index) {
    const { dataSource, pressItem } = this.state;
    const rowData = dataSource[index];
    const styleType = rowData.meta.style;
    return (
      <View style={styles.rowContainer}>
        <View
          onPressIn={() => this.feedback(rowData.path)}
          onPressOut={() => this.feedback()}
          onClick={() => this.clickTo(rowData.path)}
          style={[styles.buttonView, {
            borderColor: (styleType === 1 ? SKIN_COLOR.mainLight : SKIN_COLOR.otherLight),
            opacity: (pressItem === rowData.path ? 0.5 : 1),
          }]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: (styleType === 1 ? SKIN_COLOR.mainLight : SKIN_COLOR.otherLight) },
            ]}
          >
            {rowData.name}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const { dataSource } = this.state;
    return (
      <ListView
        style={{ flex: 1, backgroundColor: '#ffffff' }}
        numberOfRows={dataSource.length}
        renderRow={this.renderRow}
        getRowType={this.getRowType}
        getRowKey={this.getRowKey}
      />
    );
  }
}

export default withRouter(Gallery);
