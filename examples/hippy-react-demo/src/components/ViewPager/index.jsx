import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewPager,
} from '@hippy/react';
import { CirclePagerView, SquarePagerView, TrianglePagerView } from '../../shared/PagerItemView';
import Tab from "./tab";

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
      offset: 0,
      position: 0
    };

    constructor(props) {
      super(props);
      this.onPageSelected = this.onPageSelected.bind(this);
    }

    // eslint-disable-next-line class-methods-use-this
    onPageSelected(pageData) {
      // eslint-disable-next-line no-console
      // console.log('onPageSelected', pageData);
      this.setState({
        selectedIndex: pageData.position,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    onPageScroll = ({ offset, position, ...others }) => {
      // eslint-disable-next-line no-console
      console.log('onPageScroll====》', offset, position, others);
      this.setState({
        offset,
        position
      });
    }

    render() {
      const { selectedIndex, offset, position } = this.state;
      return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <Tab tabs={["第1页", "第2页", "第3页"]} offset={offset} position={position} />
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
          <ViewPager
            ref={(ref) => {
              this.viewpager = ref;
            }}
            style={styles.container}
            initialPage={0}
            keyboardDismissMode="none"
            scrollEnabled
            onPageSelected={this.onPageSelected}
            onPageScroll={this.onPageScroll}
          >
            {
              [
                SquarePagerView(),
                TrianglePagerView(),
                CirclePagerView(),
              ]
            }
          </ViewPager>
          <View style={styles.dotContainer}>
            {
              new Array(PAGE_COUNT).fill(0)
                .map((n, i) => {
                  const isSelect = i === selectedIndex;
                  return (
                  // eslint-disable-next-line react/jsx-key
                  <View style={[styles.dot, isSelect ? styles.selectDot : null]} />
                  );
                })
            }
          </View>
        </View>
      );
    }
}
