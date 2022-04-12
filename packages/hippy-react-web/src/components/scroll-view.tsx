/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useImperativeHandle, useState } from 'react';
import animateScrollTo from 'animated-scroll-to';
import StyleSheet from '../modules/stylesheet';
import { isFunc, getViewRefNode, noop } from '../utils';
import { HIDE_SCROLLBAR_CLASS, shouldHideScrollBar } from '../adapters/hide-scrollbar';
import { View, ViewProps } from './view';

const styles = StyleSheet.create({
  baseVertical: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  baseHorizontal: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  contentContainerVertical: {
    collapse: false,
    flexDirection: 'column',
  },
  contentContainerHorizontal: {
    collapse: false,
    flexDirection: 'row',
  },
  scrollDisable: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    touchAction: 'none',
  },
  hideScrollbar: {
    scrollbarWidth: 'none',
  },
  pagingEnabledHorizontal: {
    scrollSnapType: 'x mandatory',
  },
  pagingEnabledVertical: {
    scrollSnapType: 'y mandatory',
  },
  pagingEnabledChild: {
    scrollSnapAlign: 'start',
  },
});

export interface ScrollViewProps extends ViewProps {
  bounces?: boolean; // unsupported yet
  contentContainerStyle?: any;
  horizontal?: boolean;
  onMomentumScrollBegin?: Function;
  onMomentumScrollEnd?: Function;
  onScroll?: (e: any) => void;
  onScrollBeginDrag?: Function;
  onScrollEndDrag?: Function;
  pagingEnabled?: boolean;
  scrollEventThrottle?: number;
  scrollIndicatorInsets?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }; // unsupported yet
  scrollEnabled?: boolean;
  showScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean; // unsupported yet
  showsVerticalScrollIndicator?: boolean; // unsupported yet
}

export interface ScrollEvent {
  contentOffset: {
    x: number;
    y: number;
  };
  contentSize: {
    height: number;
    width: number;
  };
  layoutMeasurement: {
    height: number;
    width: number;
  };
  timestamp: number;
}

const getScrollEvent = (e: any) => {
  const scrollEvent: ScrollEvent = {
    contentOffset: {
      x: e.target.scrollLeft,
      y: e.target.scrollTop,
    },
    contentSize: {
      height: e.target.scrollHeight,
      width: e.target.scrollWidth,
    },
    layoutMeasurement: {
      height: e.target.offsetHeight,
      width: e.target.offsetWidth,
    },
    timestamp: Date.now(),
  };
  return scrollEvent;
};

const shouldEmitScrollEvent = (lastTick: number, eventThrottle: number) => {
  const timeSinceLastTick = Date.now() - lastTick;
  return eventThrottle > 0 && timeSinceLastTick >= eventThrottle;
};

const ScrollView: React.FC<ScrollViewProps> = React.forwardRef((props, ref) => {
  const copyProps = { ...props };
  // delete unsupported prop
  delete copyProps.bounces;
  const {
    style,
    onScroll,
    horizontal,
    scrollEnabled = true,
    scrollEventThrottle = 0,
    pagingEnabled = false,
    showScrollIndicator = false,
    onScrollBeginDrag = noop,
    onScrollEndDrag = noop,
    onMomentumScrollBegin = noop,
    onMomentumScrollEnd = noop,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    contentContainerStyle,
    ...rest
  } = copyProps;

  shouldHideScrollBar(!showScrollIndicator);
  const scrollState = React.useRef({ isScrolling: false, scrollLastTick: 0 });
  const scrollTimeout = React.useRef<null | number>(null);
  const scrollRef = React.useRef<any>(null);
  const [isTouchStart, setIsTouchStart] = useState(false);
  const [isBeginDragCalled, setIsBeginDragCalled] = useState(false);

  const directionStyle = horizontal ? styles.baseHorizontal : styles.baseVertical;
  const pagingEnabledStyle = horizontal ? styles.pagingEnabledHorizontal : styles.pagingEnabledVertical;

  const containerStyle = Object.assign(
    {}, horizontal ? styles.contentContainerHorizontal : styles.contentContainerVertical,
    contentContainerStyle,
  );

  const onTouchStart = () => {
    setIsTouchStart(() => true);
  };
  const onTouchMove = () => {
    if (isTouchStart && scrollEnabled) {
      onScrollBeginDrag();
      setIsTouchStart(false);
      setIsBeginDragCalled(true);
    }
  };
  const onTouchEnd = () => {
    if (isBeginDragCalled && scrollEnabled) {
      onScrollEndDrag();
    }
  };


  const handleScrollTick = (e: any) => {
    scrollState.current.scrollLastTick = Date.now();
    if (onScroll) {
      onScroll(getScrollEvent(e));
    }
  };
  const handleScrollEnd = (e: any) => {
    if (isFunc(onMomentumScrollEnd)) {
      onMomentumScrollEnd();
    }
    scrollState.current.isScrolling = false;
    if (onScroll) {
      onScroll(getScrollEvent(e));
    }
  };
  const handleScrollStart = (e: any) => {
    if (isFunc(onMomentumScrollBegin)) {
      onMomentumScrollBegin();
    }
    scrollState.current.isScrolling = true;
    handleScrollTick(e);
  };
  const handleScroll = (e: any) => {
    e.stopPropagation();
    const scrollElement = getViewRefNode(scrollRef);
    if (e.target === scrollElement) {
      if (scrollTimeout.current !== null) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = Number(setTimeout(() => {
        handleScrollEnd(e);
      }, scrollEventThrottle || 100));
      if (scrollState.current.isScrolling) {
        if (shouldEmitScrollEvent(scrollState.current.scrollLastTick, scrollEventThrottle)) {
          handleScrollTick(e);
        }
      } else {
        handleScrollStart(e);
      }
    }
  };
  const children = pagingEnabled ? React.Children.map(props.children, (child) => {
    if (child !== null) {
      return <View style={styles.pagingEnabledChild}>{child}</View>;
    }
    return child;
  }) : props.children;

  // set methods
  useImperativeHandle(ref, () => ({
    scrollTo: (param: { x: number, y: number, animated: boolean }) => {
      const { x, y, animated } = param;
      const scrollElement = getViewRefNode(scrollRef);
      if (animated) {
        animateScrollTo([x, y], {
          elementToScroll: scrollElement || undefined,
        });
      } else {
        scrollElement?.scrollTo(x, y);
      }
    },
    scrollToWithDuration: (param: { x: number, y: number, duration: number }) => {
      const { x, y, duration } = param;
      const scrollElement = getViewRefNode(scrollRef);
      // minDuration 250, maxDuration 3000
      animateScrollTo([x, y], {
        elementToScroll: scrollElement || undefined,
        minDuration: duration,
        maxDuration: duration,
      });
    },
  }));

  return (
    <View
      {...rest}
      onScroll={handleScroll}
      onTouchDown={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={!showScrollIndicator && HIDE_SCROLLBAR_CLASS}
      ref={scrollRef}
      style={[
        directionStyle,
        style,
        !scrollEnabled && styles.scrollDisable,
        pagingEnabled && pagingEnabledStyle,
      ]}
    >
      <View style={containerStyle}>
        { children }
      </View>
    </View>
  );
});

ScrollView.displayName = 'ScrollView';
export default ScrollView;
