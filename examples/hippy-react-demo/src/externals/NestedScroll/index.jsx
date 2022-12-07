import React from 'react';
import {
  ListView,
  View,
  StyleSheet,
  Text,
  ViewPager,
  ScrollView,
} from '@hippy/react';

const styles = StyleSheet.create({
  demoWrap: {
    horizontal: false,
    flex: 1,
    flexDirection: 'column',
  },
  banner: {
    backgroundImage: 'https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png',
    backgroundSize: 'cover',
    height: 150,
    justifyContent: 'flex-end',
  },
  bannerText: {
    color: 'coral',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    height: 30,
  },
  tabText: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#eee',
    color: '#999',
  },
  tabSelected: {
    flex: 1,
    textAlign: 'center',
    color: '#4c9afa',
  },
  itemEven: {
    height: 40,
    backgroundColor: 'gray',
  },
  itemEvenText: {
    lineHeight: 40,
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  itemOdd: {
    height: 40,
  },
  itemOddText: {
    lineHeight: 40,
    fontSize: 20,
    textAlign: 'center',
  },
});

export default class NestedScrollExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layoutHeight: 0,
      currentSlide: 0,
    };
  }

  selectPage(i) {
    this.setState({ currentSlide: i });
    this.viewPager?.setPage(i);
  }

  render() {
    const { layoutHeight, currentSlide } = this.state;
    return (
      <ScrollView
        style={styles.demoWrap}
        scrollEventThrottle={50}
        onLayout={e => this.setState({ layoutHeight: e.layout.height })} >
        <View style={styles.banner}>
        </View>
        <View style={styles.tabs}>
          <Text
            key="tab1"
            style={(currentSlide === 0) ? styles.tabSelected : styles.tabText}
            onClick={() => this.selectPage(0)}>
            tab 1 (parent first)
          </Text>
          <Text
            key="tab2"
            style={(currentSlide === 1) ? styles.tabSelected : styles.tabText}
            onClick={() => this.selectPage(1)}>
            tab 2 (self first)
          </Text>
        </View>
        <ViewPager
          ref={ref => this.viewPager = ref}
          initialPage={currentSlide}
          style={{ height: layoutHeight - 80 }}
          onPageSelected={e => this.setState({ currentSlide: e.position })}>
          <ListView nestedScrollTopPriority={'parent'} key={'slide1'}
            numberOfRows={30}
            getRowKey={i => `item${i}`}
            initialListSize={30}
            renderRow={i => (
              <Text style={i % 2 ? styles.itemEvenText : styles.itemOddText}>Item {i}</Text>
            )}
            getRowStyle={i => (i % 2 ? styles.itemEven : styles.itemOdd)}
          />
          <ListView nestedScrollTopPriority={'self'} key={'slide2'}
                    numberOfRows={30}
                    getRowKey={i => `item${i}`}
                    initialListSize={30}
                    renderRow={i => (
                        <Text style={i % 2 ? styles.itemEvenText : styles.itemOddText}>Item {i}</Text>
                    )}
                    getRowStyle={i => (i % 2 ? styles.itemEven : styles.itemOdd)}
          />
        </ViewPager >
      </ScrollView >);
  }
}
