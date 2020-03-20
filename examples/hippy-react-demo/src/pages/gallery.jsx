import React, { Component } from 'react';
import {
  BackAndroid,
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} from '@hippy/react';
import * as components from '../components';
import * as modules from '../modules';
import * as externals from '../externals';

import BACK_ICON from './back-icon.png';

const PAGE_LIST = {
  ...components,
  ...modules,
  ...externals,
};

const SKIN_COLOR = {
  mainLight: '#4c9afa',
  otherLight: '#f44837',
  textWhite: '#fff',
};


const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: SKIN_COLOR.mainLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerButton: {
    height: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: SKIN_COLOR.textWhite,
    lineHeight: 24,
  },
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

export default class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'Home',
      // TODO: Make the demo detail be in the demo folder.
      dataSource: [
        {
          id: 'View',
          name: 'View 组件',
          style: 1,
        },
        {
          id: 'Clipboard',
          name: 'Clipboard 组件',
          style: 1,
        },
        {
          id: 'Text',
          name: 'Text 组件',
          style: 1,
        },
        {
          id: 'Image',
          name: 'Image 组件',
          style: 1,
        },
        {
          id: 'ListView',
          name: 'ListView 组件',
          style: 1,
        },
        {
          id: 'RefreshWrapper',
          name: 'RefreshWrapper 组件',
          style: 1,
        },
        {
          id: 'ScrollView',
          name: 'ScrollView 组件',
          style: 1,
        },
        {
          id: 'ViewPager',
          name: 'ViewPager 组件',
          style: 1,
        },
        {
          id: 'TextInput',
          name: 'TextInput 组件',
          style: 1,
        },
        {
          id: 'Modal',
          name: 'Modal 组件',
          style: 1,
        },
        {
          id: 'Slider',
          name: 'Slider 组件',
          style: 1,
        },
        {
          id: 'TabHost',
          name: 'TabHost 组件',
          style: 1,
        },
        {
          id: 'WebView',
          name: 'WebView 组件',
          style: 1,
        },
        {
          id: 'MyView',
          name: 'MyView 组件',
          style: 1,
        },
        {
          id: 'Animation',
          name: 'Animation 组件',
          style: 2,
        },
        {
          id: 'NetInfo',
          name: 'NetInfo 能力',
          style: 2,
        },
      ],
    };
    this.renderRow = this.renderRow.bind(this);
    this.getRowType = this.getRowType.bind(this);
    this.clickBack = this.clickBack.bind(this);
  }

  componentDidMount() {
    const { page } = this.state;
    if (Platform.OS === 'android') {
      BackAndroid.addListener(() => {
        if (page !== 'Home') {
          this.setState({
            page: 'Home',
          });
          return true;
        }
        return false;
      });
    }
  }

  getRowType(index) {
    const { dataSource } = this.state;
    const item = dataSource[index];
    if (!item.style) {
      return null;
    }
    return item.style;
  }

  feedback(itemId) {
    const pressItem = itemId || '';
    this.setState({
      pressItem,
    });
  }


  clickTo(pageId) {
    this.setState({
      page: pageId,
    });
  }

  clickBack() {
    this.setState({
      page: 'Home',
    });
  }

  renderRow(index) {
    const { dataSource, pressItem } = this.state;
    const rowData = dataSource[index];
    switch (rowData.style) {
      case 0:
        return (
          <View style={{ height: 30 }}>
            <Text style={{ flex: 1, textAlign: 'center', lineHeight: 30 }}>
              { rowData.text }
            </Text>
          </View>
        );
      case 1:
      case 2:
        return (
          <View style={styles.rowContainer}>
            <View
              onPressIn={() => this.feedback(rowData.id)}
              onPressOut={() => this.feedback()}
              onClick={() => this.clickTo(rowData.id)}
              style={[styles.buttonView, {
                borderColor: (rowData.style === 1 ? SKIN_COLOR.mainLight : SKIN_COLOR.otherLight),
                opacity: (pressItem === rowData.id ? 0.5 : 1),
              }]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: (rowData.style === 1 ? SKIN_COLOR.mainLight : SKIN_COLOR.otherLight) },
                ]}
              >
                {rowData.name}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  }

  render() {
    const { dataSource } = this.state;
    let header;
    let content;
    const { page } = this.state;
    if (page === 'Home') {
      header = (
        <View style={[styles.container]}>
          <View style={{ backgroundColor: styles.title.backgroundColor, marginLeft: 12  }}>
            <Text numberOfLines={1} style={[styles.title, { fontWeight: 'bold' }]}>
              Hippy React 示例
            </Text>
          </View>
        </View>
      );
      content = (
        <ListView
          style={{ flex: 1, backgroundColor: '#ffffff' }}
          numberOfRows={dataSource.length}
          renderRow={this.renderRow}
          getRowType={this.getRowType}
        />
      );
    } else {
      header = (
        <View style={[styles.container]}>
          <View
            onClick={this.clickBack}
            style={[styles.headerButton, Platform.OS === 'ios' ? null : { marginLeft: 20 }]}
          >
            <Image
              style={styles.backIcon}
              source={{ uri: BACK_ICON }}
            />
          </View>
          <View style={styles.headerButton}>
            <Text numberOfLines={1} style={styles.title}>
              {page}
            </Text>
          </View>
        </View>
      );
      const Content = PAGE_LIST[page];
      content = <Content />;
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        { header }
        { content }
      </View>
    );
  }
}
