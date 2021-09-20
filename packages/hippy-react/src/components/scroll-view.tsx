/* eslint-disable no-underscore-dangle */

import React from 'react';
import Style from '@localTypes/style';
import * as StyleSheet from '../modules/stylesheet';
import { callUIFunction } from '../modules/ui-manager-module';
import Element from '../dom/element-node';
import { warn } from '../utils';
import { isRTL } from '../utils/i18n';
import View from './view';

interface ScrollViewProps {
  /**
   * When true, the scroll view's children are arranged horizontally in a row
   * instead of vertically in a column.
   * The default value is `false`.
   */
  horizontal?: boolean;

  /**
   * When `true`, the scroll view stops on multiples of the scroll view's size when scrolling.
   * This can be used for horizontal pagination.
   * Default: false
   */
  pagingEnabled?: boolean;

  /**
   * When `false`, the view cannot be scrolled via touch interaction.
   * Default: true
   *
   * > Note that the view can always be scrolled by calling scrollTo.
   */
  scrollEnabled?: boolean;

  /**
   * When `true`, shows a horizontal scroll indicator.
   * Default: true
   */
  showsHorizontalScrollIndicator?: boolean;

  /**
   * When `true`, shows a vertical scroll indicator.
   * Default: true
   */
  showsVerticalScrollIndicator?: boolean;

  /**
   * These styles will be applied to the scroll view content container which wraps all
   * of the child views.
   */
  contentContainerStyle?: Style;

  /**
   * This controls how often the scroll event will be fired while scrolling
   * (as a time interval in ms). A lower number yields better accuracy for code
   * that is tracking the scroll position, but can lead to scroll performance
   * problems due to the volume of information being send over the bridge.
   * You will not notice a difference between values set between 1-16 as the JS run loop
   * is synced to the screen refresh rate. If you do not need precise scroll position tracking,
   * set this value higher to limit the information being sent across the bridge.
   *
   * The default value is zero, which results in the scroll event being sent only once
   * each time the view is scrolled.
   */
  scrollEventThrottle?: number;

  /**
   * The amount by which the scroll view indicators are inset from the edges of the scroll view.
   * This should normally be set to the same value as the `contentInset`.
   *
   * Default: {top: 0, right: 0, bottom: 0, left: 0}.
   */
  scrollIndicatorInsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /**
   * Called when the momentum scroll starts (scroll which occurs as the ScrollView starts gliding).
   */
  onMomentumScrollBegin?(): void;

  /**
   * Called when the momentum scroll ends (scroll which occurs as the ScrollView glides to a stop).
   */
  onMomentumScrollEnd?(): void;

  /**
   * Fires at most once per frame during scrolling.
   * The frequency of the events can be controlled using the `scrollEventThrottle` prop.
   *
   * @param {Object} evt - Scroll event data.
   * @param {number} evt.contentOffset.x - Offset X of scrolling.
   * @param {number} evt.contentOffset.y - Offset Y of scrolling.
   */
  onScroll?(evt: { contentOffset: { x: number, y: number }}): void;

  /**
   * Called when the user begins to drag the scroll view.
   */
  onScrollBeginDrag?(): void;

  /**
   * Called when the user stops dragging the scroll view and it either stops or begins to glide.
   */
  onScrollEndDrag?(): void;
  style?: Style;
}

const styles = StyleSheet.create({
  baseVertical: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
    overflow: 'scroll',
  },
  baseHorizontal: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    overflow: 'scroll',
  },
  contentContainerVertical: {
    collapsable: false,
    flexDirection: 'column',
  },
  contentContainerHorizontal: {
    collapsable: false,
    flexDirection: 'row',
  },
});

/**
 * Scrollable View without recycle feature.
 *
 * If you need to implement a long list, use `ListView`.
 * @noInheritDoc
 */
class ScrollView extends React.Component<ScrollViewProps, {}> {
  private instance: Element | HTMLDivElement | null = null;

  /**
   * Scrolls to a given x, y offset, either immediately, with a smooth animation.
   *
   * @param {number} x - Scroll to horizon position X.
   * @param {number} y - Scroll To veritical position Y.
   * @param {boolean} animated - With smooth animation.By default is true.
   */
  public scrollTo(
    x: number | { x: number; y: number; animated: boolean; },
    y: number,
    animated = true,
  ) {
    let x_ = x;
    let y_ = y;
    let animated_ = animated;
    if (typeof x === 'number') {
      warn('`scrollTo(x, y, animated)` is deprecated, Use `scrollTo({x: 5, y: 5, animated: true})` instead.');
    } else if (typeof x === 'object' && x) {
      ({ x: x_, y: y_, animated: animated_ } = x);
    }
    x_ = x_ || 0;
    y_ = y_ || 0;
    animated_ = !!animated_;
    callUIFunction(this.instance as Element, 'scrollTo', [x_, y_, animated_]);
  }

  /**
   * Scrolls to a given x, y offset, with specific duration of animation.
   *
   * @param {number} x - Scroll to horizon position X.
   * @param {number} y - Scroll To veritical position Y.
   * @param {number} duration - Duration of animation execution time, with ms unit.
   *                            By default is 1000ms.
   */
  public scrollToWithDuration(x = 0, y = 0, duration = 1000) {
    callUIFunction(this.instance as Element, 'scrollToWithOptions', [{ x, y, duration }]);
  }

  /**
   * @ignore
   */
  public render() {
    const {
      horizontal,
      contentContainerStyle,
      children,
      style,
    } = this.props;
    const contentContainerStyle_ = [
      horizontal ? styles.contentContainerHorizontal : styles.contentContainerVertical,
      contentContainerStyle,
    ];
    const newStyle = horizontal
      ? Object.assign({}, styles.baseHorizontal, style)
      : Object.assign({}, styles.baseVertical, style);

    if (horizontal) {
      newStyle.flexDirection = isRTL() ? 'row-reverse' : 'row';
    }

    return (
      <div
        nativeName="ScrollView"
        ref={(ref) => {
          this.instance = ref;
        }}
        {...this.props}
        // @ts-ignore
        style={newStyle}
      >
        <View
          // @ts-ignore
          style={contentContainerStyle_}>
          {children}
        </View>
      </div>
    );
  }
}
export default ScrollView;
