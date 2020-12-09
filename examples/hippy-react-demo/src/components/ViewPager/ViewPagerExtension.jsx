import React from 'react';
import {
  Dimensions, StyleSheet, View, ViewPager, Text,
} from '@hippy/react';
import { CirclePagerView, SquarePagerView, TrianglePagerView } from '../../shared/PagerItemView';

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_DOT_RADIUS = 6;
const PAGE_COUNT = 7; // 循环滚动的最小数量为4，如果不足4的话，可以自己double一下

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
});

export default class PagerExtensionExample extends React.Component {
  state = {
    selectedIndex: 0,
    // 用于指定每个page相对于屏幕宽度的百分比（取值范围：0.0~1.0）
    pageSize: 0.75,
    /*
     用于指定每个page相对于屏幕左边缘的偏移量
     在不指定middlePageOffset属性时，page相对于屏幕左右居中
    */
    middlePageOffset: 25.0,
  };

  constructor(props) {
    super(props);
    this.onPageSelected = this.onPageSelected.bind(this);
  }

  onPageSelected(pageData) {
    this.setState({
      selectedIndex: pageData.position % PAGE_COUNT,
    });
  }

  render() {
    const { selectedIndex, pageSize, middlePageOffset } = this.state;
    const arr = new Array(PAGE_COUNT).fill(0);
    const itemViews = arr.map((n, i) => {
      const title = `第${i + 1}页`;
      let shape;
      let backgroundColor;
      if (i % 2 === 0) {
        shape = SquarePagerView(title);
        backgroundColor = 'red';
      } else if (i % 3 === 0) {
        shape = TrianglePagerView(title);
        backgroundColor = 'yellow';
      } else {
        shape = CirclePagerView(title);
        backgroundColor = 'gray';
      }
      return (
        <View
          style={{
            flex: 1,
            width: screenWidth * pageSize,
            backgroundColor,
          }}
        >
          {shape}
        </View>
      );
    });
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Text>扩展属性</Text>
        <ViewPager
          ref={(ref) => {
            this.viewpager = ref;
          }}
          style={styles.container}
          initialPage={0}
          loop
          pageSize={pageSize}
          middlePageOffset={middlePageOffset}
          keyboardDismissMode="none"
          scrollEnabled
          onPageSelected={this.onPageSelected}
        >
          {itemViews}
        </ViewPager>
        <View style={styles.dotContainer}>
          {
            arr.map((n, i) => {
              const isSelect = i === selectedIndex;
              return (
                <View style={[styles.dot, isSelect ? styles.selectDot : null]} />
              );
            })
          }
        </View>
      </View>
    );
  }
}
