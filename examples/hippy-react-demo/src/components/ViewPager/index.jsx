import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewPager,
  RefreshWrapper,
} from '@hippy/react';
import { CirclePagerView, SquarePagerView, TrianglePagerView } from '../../shared/PagerItemView';

const DEFAULT_DOT_RADIUS = 6;
const PAGE_COUNT = 3;

const styles = StyleSheet.create({
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DEFAULT_DOT_RADIUS,
    height: DEFAULT_DOT_RADIUS,
    // eslint-disable-next-line no-bitwise
    borderRadius: DEFAULT_DOT_RADIUS >> 1,
    // eslint-disable-next-line no-bitwise
    margin: DEFAULT_DOT_RADIUS >> 1,
    backgroundColor: '#BBBBBB',
    // bottom: 16
  },
  selectDot: {
    backgroundColor: '#000000',
  },
  container: {
    height: 500,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  button: {
    width: 120,
    height: 36,
    backgroundColor: '#4c9afa',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default class PagerExample extends React.Component {
    state = {
      selectedIndex: 0,
    };

    constructor(props) {
      super(props);
      this.onPageSelected = this.onPageSelected.bind(this);
      this.onPageScrollStateChanged = this.onPageScrollStateChanged.bind(this);
      this.onRefresh = this.onRefresh.bind(this);
      this.getRefresh = this.getRefresh.bind(this);
      this.onFooterRefresh = this.onFooterRefresh.bind(this);
      this.getFooterRefresh = this.getFooterRefresh.bind(this);
    }

    onPageSelected(pageData) {
      console.log('onPageSelected', pageData.position);
      this.setState({
        selectedIndex: pageData.position,
      });
    }

    onPageScrollStateChanged(pageScrollState) {
      console.log('onPageScrollStateChanged', pageScrollState);
    }

    onPageScroll({ offset, position }) {
      console.log('onPageScroll', offset, position);
    }

    /**
     * callback for header
     */
    onRefresh() {
      setTimeout(async () => {
        console.log('RefreshWrapper onRefresh');
        this.refresh.refreshCompleted();
      }, 3000);
    }

    /**
     *  get header view
     */
    getRefresh() {
      return (
      <View style={{ flex: 1, width: 80, backgroundColor: 'green' }}>
        <View style={{ flex: 2 }}></View>
        <View style={{ width: 40, height: 40, alignSelf: 'center', backgroundColor: 'red' }}></View>
        <Text style={{ flex: 1, marginTop: 10, textAlign: 'center' }}>刷新中...</Text>
        <View style={{ flex: 2 }}></View>
      </View>
      );
    }

    /**
     * callback for footer
     */
    onFooterRefresh() {
      setTimeout(async () => {
        console.log('RefreshWrapper onFooterRefresh');
        this.refresh.refreshFooterCompleted();
      }, 3000);
    }

    /**
     *  get footer view
     */
    getFooterRefresh() {
      return (
      <View style={{ flex: 1, width: 80, backgroundColor: 'green' }}>
        <View style={{ flex: 2 }}></View>
        <View style={{ width: 40, height: 40, alignSelf: 'center', backgroundColor: 'red' }}></View>
        <Text style={{ flex: 1, marginTop: 10, textAlign: 'center' }}>刷新中...</Text>
        <View style={{ flex: 2 }}></View>
      </View>
      );
    }

    render() {
      const { selectedIndex } = this.state;
      return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View style={styles.buttonContainer}>
            <View
              style={styles.button}
              onClick={() => {
                this.viewpager.setPage(2);
              }}
            >
              <Text style={styles.buttonText}>动效滑到第3页</Text>
            </View>
            <View style={styles.button} onClick={() => this.viewpager.setPageWithoutAnimation(0)}>
              <Text style={styles.buttonText}>直接滑到第1页</Text>
            </View>
          </View>

          <RefreshWrapper
            ref={(ref) => {
              this.refresh = ref;
            }}
            style={{ flex: 1 }}
            horizontal={true}
            hiddenHeader={false}
            showFooter={true}
            onRefresh={this.onRefresh}
            onFooterRefresh={this.onFooterRefresh}
            bounceTime={500}
            getRefresh={this.getRefresh}
            getFooterRefresh={this.getFooterRefresh}
          >

            <ViewPager
              ref={(ref) => {
                this.viewpager = ref;
              }}
              style={styles.container}
              initialPage={0}
              keyboardDismissMode="none"
              scrollEnabled
              onPageSelected={this.onPageSelected}
              onPageScrollStateChanged={this.onPageScrollStateChanged}
              onPageScroll={this.onPageScroll}
            >
              {
                [
                  SquarePagerView('squarePager'),
                  TrianglePagerView('TrianglePager'),
                  CirclePagerView('CirclePager'),
                ]
              }
            </ViewPager>

            </RefreshWrapper>

          <View style={styles.dotContainer}>
            {
              new Array(PAGE_COUNT).fill(0)
                .map((n, i) => {
                  const isSelect = i === selectedIndex;
                  return (
                  // eslint-disable-next-line react/jsx-key
                  <View style={[styles.dot, isSelect ? styles.selectDot : null]} key={`dot_${i}`}/>
                  );
                })
            }
          </View>
        </View>
      );
    }
}
