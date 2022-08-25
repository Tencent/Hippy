import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ViewPager,
  ScrollView,
} from '@hippy/react';

import BackIcon from '../../shared/back-icon.png';
const IMG_HEADER = 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png';

const styles = StyleSheet.create({
  matchParent: {
    flex: 1,
  },
  label: {
    position: 'absolute',
    left: 5,
    top: 5,
    backgroundColor: '#4c9afa',
    color: 'white',
    fontSize: 9,
    height: 12,
    lineHeight: 12,
    opacity: .75,
  },
});

const NAV_HEIGHT = 45;
const NAV_WIDTH = 90;
const navStyles = StyleSheet.create({
  container: {
    height: NAV_HEIGHT,
    paddingLeft: 4,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  navItem: {
    width: NAV_WIDTH,
    height: NAV_HEIGHT - 1,
    paddingTop: 13,
  },
  navItemText: {
    fontSize: 16,
    lineHeight: 17,
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  navItemTextNormal: {
    color: '#666666',
  },
  navItemTextBlue: {
    color: '#2D73FF',
  },
});

const listStyles = StyleSheet.create({
  itemHorizontalOdd: {
    width: 50,
    backgroundColor: '#ccc',
    padding: 10,
  },
  itemHorizontalEven: {
    width: 50,
    backgroundColor: 'white',
    padding: 10,
  },
  itemVerticalOdd: {
    height: 50,
    backgroundColor: '#ccc',
    padding: 10,
  },
  itemVerticalEven: {
    height: 50,
    backgroundColor: 'white',
    padding: 10,
  },
  letter: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    lineHeight: 50,
  },
});

const scrollStyles = StyleSheet.create({
  wrap: {
    width: 142,
    height: 142,
    margin: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  itemStyle: {
    width: 100,
    height: 100,
    lineHeight: 100,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#4c9afa',
    fontSize: 80,
    margin: 20,
    color: '#4c9afa',
    textAlign: 'center',
  },
});

function Label({ text }) {
  return (
    <Text style={styles.label}> {text} </Text>
  );
}

class ListViewExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 20,
      loading: false,
    };
    this.onEndReached = this.onEndReached.bind(this);
  }

  onEndReached() {
    const { count, loading } = this.state;
    if (!loading) {
      const newCount = count + 20;
      this.setState({ loading: true });
      setTimeout(() => this.setState({
        count: newCount,
        loading: false,
      }), 600);
    }
  }

  render() {
    const { count, loading } = this.state;
    return (
      <>
        <View style={{ height: 80 }}>
          <ListView
            bounces={false}
            horizontal={true}
            numberOfRows={20}
            renderRow={i => (<Text style={listStyles.letter}>{i}</Text>)}
            getRowStyle={i => (i % 2 ? listStyles.itemHorizontalOdd : listStyles.itemHorizontalEven)}
            getRowKey={i => `key-1-0-0-${i}`}
            scrollEventThrottle={1000}
            nestedScrollTopPriority="parent" />
          <Label text="inner horizontal list" />
        </View>
        <View style={{ flex: 1 }}>
          <ListView
            bounces={false}
            style={styles.matchParent}
            numberOfRows={count + (loading ? 1 : 0)}
            renderRow={(i) => {
              if (loading && i === count) {
                return (<Text style={{ alignSelf: 'center' }}>Loading</Text>);
              }
              return (<Text style={{}}>{`item ${i}`}</Text>);
            }}
            getRowStyle={i => (i % 2 ? listStyles.itemVerticalOdd : listStyles.itemVerticalEven)}
            getRowType={i => (loading && i === count ? 2 : 1)}
            getRowKey={i => `key-1-0-1-${i}`}
            onEndReached={this.onEndReached}
            scrollEventThrottle={1000}
            nestedScrollTopPriority="parent" />
          <Label text="inner vertical list [nestedScrollTopPriority=parent]" />
        </View>
      </>
    );
  }
}

function ViewPagerExample() {
  return (
    <>
      <View style={{ flex: 1, margin: 5, alignSelf: 'center' }}>
        <ViewPager
          style={{ width: 160, flex: 1 }}
          initialPage={0}>
          <View key={'key-1-1-0-0'} style={{ flex: 1, backgroundColor: '#ccf' }} />
          <View key={'key-1-1-0-1'} style={{ flex: 1, backgroundColor: '#cfc' }} />
          <View key={'key-1-1-0-2'} style={{ flex: 1, backgroundColor: '#fcc' }} />
        </ViewPager>
        <Label text="inner horizontal pager" />
      </View>
      <View style={{ flex: 1, margin: 5, alignSelf: 'center' }}>
        <ViewPager
          direction="vertical"
          style={{ width: 160, flex: 1 }}
          initialPage={0}>
          <View key={'key-1-1-1-0'} style={{ flex: 1, backgroundColor: '#ccf' }} />
          <View key={'key-1-1-1-1'} style={{ flex: 1, backgroundColor: '#cfc' }} />
          <View key={'key-1-1-1-2'} style={{ flex: 1, backgroundColor: '#fcc' }} />
        </ViewPager>
        <Label text="inner vertical pager" />
      </View>
    </>
  );
}

function ScrollViewExample() {
  const content = () => (<>
    <Text style={scrollStyles.itemStyle}>A</Text>
    <View style={scrollStyles.itemStyle}>
      <ScrollView horizontal={true}>
        <View style={{ width: 90, backgroundColor: '#ffc' }} />
        <View style={{ width: 90, backgroundColor: '#fcf' }} />
        <View style={{ width: 90, backgroundColor: '#cff' }} />
      </ScrollView>
      <Label text="inner ScrollView [h]" />
    </View>
    <Text style={scrollStyles.itemStyle}>B</Text>
    <View style={scrollStyles.itemStyle}>
      <ScrollView>
        <View style={{ height: 90, backgroundColor: '#cff' }} />
        <View style={{ height: 90, backgroundColor: '#ffc' }} />
        <View style={{ height: 90, backgroundColor: '#fcf' }} />
      </ScrollView>
      <Label text="inner ScrollView [v]" />
    </View>
    <Text style={scrollStyles.itemStyle}>C</Text>
    <Text style={scrollStyles.itemStyle}>D</Text>
  </>);
  return (
    <>
      <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
        <View style={scrollStyles.wrap}>
          <ScrollView nestedScrollTopPriority="parent">
            {content()}
          </ScrollView>
          <Label text="ScrollView [vertical]" />
        </View>
        <View style={scrollStyles.wrap}>
          <ScrollView horizontal={true}>
            {content()}
          </ScrollView>
          <Label text="ScrollView [horizontal]" />
        </View>
      </View>
      <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
        <View style={scrollStyles.wrap}>
          <ScrollView pagingEnabled={true} nestedScrollTopPriority="parent">
            {content()}
          </ScrollView>
          <Label text="ScrollView [vertical, paging]" />
        </View>
        <View style={scrollStyles.wrap}>
          <ScrollView pagingEnabled={true} horizontal={true}>
            {content()}
          </ScrollView>
          <Label text="ScrollView [horizontal, paging]" />
        </View>
      </View>
    </>
  );
}

export default class NestedScrollExample extends React.Component {
  constructor(props) {
    super(props);
    const { width } = Dimensions.get('window');
    this.state = {
      width,
      height: 0,
      opacity: 0,
    };
    this.navList = ['ListView', 'ViewPager', 'ScrollView'];
    this.headerHeight = 200;
    this.actionBarHeight = 50;
    this.onScroll = this.onScroll.bind(this);
  }

  onScroll(e) {
    const offset = e.contentOffset.y;
    const opacity = offset >= 150 ? 1 : Math.max(0, offset) / 150;
    this.setState({ opacity });
  }

  onNavChange(index) {
    console.log('onNavChange', index);
    this.setState({ navIndex: index });
  }

  renderNav(navList, navIndex) {
    return (
      <View style={navStyles.container}>
        {navList.map((v, idx) => (
          <View
            style={navStyles.navItem}
            key={`nav_${v}`}
            activeOpacity={0.5}
            onClick={() => {
              this.onNavChange(idx);
              this.viewPager?.setPage(idx);
            }}>
            <Text
              style={[
                navStyles.navItemText,
                navIndex === idx ? navStyles.navItemTextBlue : navStyles.navItemTextNormal,
              ]}
              numberOfLines={1}>
              {v}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  render() {
    const { width, height, opacity, navIndex } = this.state;
    const { navList, headerHeight, actionBarHeight } = this;
    return (
      <View
        style={{ flex: 1, collapsable: false }}
        onLayout={(e) => {
          console.log('onlayout', e.layout);
          this.setState({
            width: e.layout.width + 1,
            height: e.layout.height + 1,
          });
        }}>
        <ListView
          style={styles.matchParent}
          numberOfRows={2}
          bounces={false}
          getRowKey={index => `key-${index}`}
          renderRow={(index) => {
            if (index === 0) {
              return (
                <>
                  <Image style={{ flex: 1 }} source={{ uri: IMG_HEADER }} resizeMode={Image.resizeMode.cover} />
                  <Label text="list 0 item 0" />
                </>
              );
            }
            return (
              <>
                {this.renderNav(navList, navIndex)}
                <ViewPager
                  ref={viewPager => this.viewPager = viewPager}
                  style={styles.matchParent}
                  initialPage={0}
                  onPageSelected={e => this.onNavChange(e.position)}>
                  {navList.map((v, idx) => {
                    if (idx === 0) {
                      return (<ListViewExample />);
                    }
                    if (idx === 1) {
                      return (<ViewPagerExample />);
                    }
                    if (idx === 2) {
                      return (<ScrollViewExample />);
                    }
                    return (<View key={`key-1-${idx}`} style={{ flex: 1, backgroundColor: '#eef' }} />);
                  })}
                </ViewPager>
                <Label text="list 0 item 1" />
              </>
            );
          }}
          getRowStyle={(index) => {
            if (index === 0) {
              return {
                backgroundColor: '#f9c',
                height: headerHeight,
              };
            }
            return {
              backgroundColor: '#fee',
              height: height - actionBarHeight,
            };
          }}
          onScroll={this.onScroll}
          scrollEventThrottle={16}
          showScrollIndicator={false} />
        <View
          opacity={opacity}
          style={{
            flex: 1,
            width,
            height: actionBarHeight,
            backgroundColor: '#fff',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>标题</Text>
        </View>
        <View
          style={{
            width: 40,
            height: actionBarHeight,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            top: 0,
          }}>
          <Image
            tintColor="#000"
            style={{ width: 24, height: 24 }}
            source={{ uri: BackIcon }}
            resizeMode={Image.resizeMode.contain} />
        </View>
      </View>
    );
  }
}
