/* eslint-disable no-return-assign */

import React from 'react';
import { View } from './view';
import { formatWebStyle } from '../adapters/transfer';
import StyleSheet from '../modules/stylesheet';
import applyLayout from '../adapters/apply-layout';

const styles = StyleSheet.create({
  baseVertical: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    overflow: 'auto',
    display: 'block',
  },
  baseHorizontal: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    overflow: 'auto',
  },
  contentContainerVertical: {
    collapse: false,
    flexDirection: 'column',
  },
  contentContainerHorizontal: {
    collapse: false,
    flexDirection: 'row',
  },
});

function HorizontalScrollView(props) {
  const { scrollRef, ...otherProps } = props;
  return (
    <ul ref={scrollRef} {...otherProps} />
  );
}

function VerticalScrollView(props) {
  const { scrollRef, ...otherProps } = props;
  return (
    <ul ref={scrollRef} {...otherProps} />
  );
}


/**
 * Scrollable View without recycle feature.
 *
 * If you need to implement a long list, use `ListView`.
 * @noInheritDoc
 */
export class ScrollView extends React.Component {
  scrollTo(x: number, y: number) {
    this.instance.scrollTo(x, y);
  }

  render() {
    const { horizontal, children, style } = this.props;
    let { contentContainerStyle } = this.props;

    contentContainerStyle = Object.assign({}, horizontal
      ? styles.contentContainerHorizontal : styles.contentContainerVertical, contentContainerStyle);

    const contentContainer = (
      <View
        style={contentContainerStyle}
      >
        {children}
      </View>
    );

    const newProps = Object.assign({}, this.props);
    const iOSTouchStyle = {
      overflowScrolling: 'touch',
      WebkitOverflowScrolling: 'touch',
    };
    const newStyle = horizontal
      ? { ...formatWebStyle(style), ...iOSTouchStyle, ...styles.baseHorizontal }
      : { ...formatWebStyle(style), ...iOSTouchStyle, ...styles.baseVertical };
    newProps.style = formatWebStyle(newStyle);
    if (typeof newProps.onScroll === 'function') {
      const onScrollFunc = newProps.onScroll;
      newProps.onScroll = undefined;
      let waiting = false;
      let endScrollHandle: any = null;
      newProps.onScroll = (e) => {
        const target = e.currentTarget;
        const eventParam = {
          contentOffset: {
            x: target.scrollLeft,
            y: target.scrollTop,
          },
          layoutMeasurement: {
            height: target.clientHeight,
            width: target.clientWidth,
          },
        };

        if (waiting) {
          return;
        }
        waiting = true;

        clearTimeout(endScrollHandle);

        onScrollFunc(eventParam);

        setTimeout(() => {
          waiting = false;
        }, 100);

        endScrollHandle = setTimeout(() => {
          onScrollFunc(eventParam);
        }, 200);
      };
    }
    if (newProps.scrollEnabled === false) {
      newProps.style.overflow = 'hidden';
    } else {
      newProps.style.overflow = 'scroll';
    }
    newProps.scrollEnabled = undefined;
    newProps.showsVerticalScrollIndicator = undefined;
    newProps.showsHorizontalScrollIndicator = undefined;
    newProps.horizontal = undefined;
    if (horizontal) {
      return (
        <HorizontalScrollView
          scrollRef={ref => this.instance = ref}
          {...newProps}
        >
          {contentContainer}
        </HorizontalScrollView>
      );
    }
    return (
      <VerticalScrollView
        scrollRef={ref => this.instance = ref}
        {...newProps}
      >
        {contentContainer}
      </VerticalScrollView>
    );
  }
}

export default applyLayout(ScrollView);
