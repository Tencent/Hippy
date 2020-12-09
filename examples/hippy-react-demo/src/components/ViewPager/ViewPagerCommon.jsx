import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewPager,
} from '@hippy/react';
import { CirclePagerView, SquarePagerView, TrianglePagerView } from '../../shared/PagerItemView';

const DEFAULT_DOT_RADIUS = 6;
const PAGE_COUNT = 7;

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
    flex: 1,
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

export default class PagerCommonExample extends React.Component {
  state = {
    selectedIndex: 0,
  };

  constructor(props) {
    super(props);
    this.onPageSelected = this.onPageSelected.bind(this);
  }

  onPageSelected(pageData) {
    this.setState({
      selectedIndex: pageData.position,
    });
  }

  render() {
    const { selectedIndex } = this.state;
    const arr = new Array(PAGE_COUNT).fill(0);
    const itemViews = arr.map((n, i) => {
      const title = `第${i + 1}页`;
      if (i % 2 === 0) return SquarePagerView(title);
      if (i % 3 === 0) return TrianglePagerView(title);
      return CirclePagerView(title);
    });
    const dots = arr.map((n, i) => {
      const isSelect = i === selectedIndex;
      return (
        <View style={[styles.dot, isSelect ? styles.selectDot : null]} />
      );
    });
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
        <ViewPager
          ref={(ref) => {
            this.viewpager = ref;
          }}
          style={styles.container}
          initialPage={0}
          keyboardDismissMode="none"
          scrollEnabled
          onPageSelected={this.onPageSelected}
        >
          {itemViews}
        </ViewPager>
        <View style={styles.dotContainer}>
          {dots}
        </View>
      </View>
    );
  }
}
