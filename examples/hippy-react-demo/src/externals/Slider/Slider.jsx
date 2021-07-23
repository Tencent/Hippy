import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
} from '@hippy/react';

const styles = StyleSheet.create({
  style_indicator_item: {
    width: 4,
    height: 4,
    marginLeft: 2.5,
    marginRight: 2.5,
    borderRadius: 2,
  },
  style_indicator: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    marginLeft: 0,
    marginRight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

class Indicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.current || 0,
    };
  }

  update(index) {
    const { current } = this.state;
    if (current === index) return;
    this.setState({
      current: index,
    });
  }

  render() {
    const { count: itemCount } = this.props;
    const { current: currentIndex } = this.state;
    const indicatorItems = [];
    for (let i = 0; i < itemCount; i += 1) {
      if (currentIndex === i) {
        indicatorItems.push(<View style={[styles.style_indicator_item, { backgroundColor: '#2424244c' }]} key={i} />);
      } else {
        indicatorItems.push(<View style={[styles.style_indicator_item, { backgroundColor: '#ffffffaa' }]} key={i} />);
      }
    }
    return (
      <View style={styles.style_indicator}>
        {indicatorItems}
      </View>
    );
  }
}

export default class Slider extends React.Component {
  static defaultProps = {
    duration: 0,
    currentPage: 0,
    images: [],
  };

  constructor(props) {
    super(props);
    this.imgWidth = props.style.width;
    this.imgHeight = props.style.height;
    this.itemCount = props.images.length;
    this.duration = props.duration;
    this.touchStartOffset = 0;
    this.touchEndOffset = 0;
    this.scrollOffset = 0;
    this.interval = null;
    this.currentIndex = 0;
    this.width = 0;
    this.onLayout = this.onLayout.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
    this.onScrollEndDrag = this.onScrollEndDrag.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.duration = this.props.duration;
    this.doCreateTimer();
  }

  componentDidUpdate() {
    // eslint-disable-next-line react/destructuring-assignment
    this.duration = this.props.duration;
    this.doCreateTimer();
  }

  componentWillUnmount() {
    this.doClearTimer();
  }

  onScroll(e) {
    const { images } = this.props;
    if (this.width === 0) return;
    const offset = e.contentOffset.x;
    this.scrollOffset = offset;
    // 过半 确定索引
    const idx = Math.round(offset / this.width);

    const count = images ? React.Children.count(images) : 0;

    if (idx < 0 || idx >= count) return;

    this.indicator.update(idx);
    this.currentIndex = idx;
  }

  onScrollBeginDrag() {
    this.touchStartOffset = this.scrollOffset;
    this.doClearTimer();
  }

  onScrollEndDrag() {
    this.doCreateTimer();
  }

  onLayout(e) {
    this.width = e.layout.width;
  }

  doSwitchPage(index) {
    this.scrollview.scrollTo(this.imgWidth * index, 0, true);
  }

  doCreateTimer() {
    this.doClearTimer();
    if (this.duration <= 0) {
      return;
    }
    this.interval = setInterval(() => {
      this.doSwitchPage((this.currentIndex + 1) % this.itemCount);
    }, this.duration);
  }

  doClearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = null;
  }

  render() {
    const { images } = this.props;
    const childViews = [];
    for (let i = 0; i < this.itemCount; i += 1) {
      childViews.push((
        <Image
          source={{ uri: images[i] }}
          style={{ width: this.imgWidth, height: this.imgHeight }}
          key={i}
        />
      ));
    }
    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          style={{ width: this.imgWidth, height: this.imgHeight }}
          onLayout={this.onLayout}
          onScroll={this.onScroll}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onScrollEndDrag={this.onScrollEndDrag}
          ref={(ref) => {
            this.scrollview = ref;
          }}
        >
          {childViews}
        </ScrollView>
        <Indicator ref={(ref) => {
          this.indicator = ref;
        }} count={this.itemCount} />
      </View>
    );
  }
}
