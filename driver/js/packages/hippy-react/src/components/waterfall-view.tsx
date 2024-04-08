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

/* eslint-disable no-param-reassign */

import React from 'react';
import { Fiber } from '@hippy/react-reconciler';
import { callUIFunction } from '../modules/ui-manager-module';
import { warn } from '../utils';
import PullHeader from './pull-header';
import PullFooter from './pull-footer';
import View from './view';
import { Device } from '../native';

type DataItem = any;

interface WaterfallViewProps {
  // Specific number of waterfall column
  numberOfColumns: number;

  // Number of total items
  numberOfItems: number;

  // Inner content padding
  contentInset?: { top?: number, left?: number, bottom?: number, right?: number };

  // Horizontal space between columns
  columnSpacing: number;

  // Vertical margin between items
  interItemSpacing: number;

  // Number of items to preload on reaching the listview end
  preloadItemNumber?: number;

  style?: HippyTypes.Style;

  // Declare whether PullHeader view exists
  containPullHeader?: boolean;

  // Declare whether PullFooter view exists
  containPullFooter?: boolean;

  // Scroll to offset after WaterfallView with data rendered
  initialContentOffset?: number;

  // Declare whether banner view exists
  containBannerView?: boolean

  // Return banner view element
  renderBanner?: () => React.ReactElement;

  /**
   * Passing the data and returns the row component.
   *
   * @param {Object} data - Data for row rendering
   * @returns {(React.Component | undefined)}
   */
  renderItem?: (
    data: DataItem,
  ) => React.ReactElement;

  renderPullHeader?: () => React.ReactElement;

  renderPullFooter?: () => React.ReactElement;

  /**
   * Each row have different type, it will be using at render recycle.
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getItemType?: (index: number) => number;

  /**
   * Returns the style for specific index of row.
   *
   * @param {number} index - Index Of data.
   * @returns {Object}
   */
  getItemStyle?: (index: number) => HippyTypes.Style;

  /**
   * Specific the key of row, for better data diff
   * More info: https://reactjs.org/docs/lists-and-keys.html
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getItemKey?: (index: number) => string;

  // Called when the WaterfallView is scrolling to bottom.
  onEndReached?: () => void;

  /**
   *  Called when the row first layout or layout changed.
   *
   * @param {Object} evt - Layout event data
   * @param {number} evt.x - The position X of component
   * @param {number} evt.y - The position Y of component
   * @param {number} evt.width - The width of component
   * @param {number} evt.height - The height of component
   * @param {number} index - Index of data.
   */
  onItemLayout?: (evt: HippyTypes.LayoutEvent, index: number) => void;

  /**
   * Called when user scrolls WaterfallView
   *
   * @param {Object} evt - onScroll event
   * @param {number} evt.startEdgePos - Scrolled offset of List top edge
   * @param {number} evt.endEdgePos - Scrolled offset of List end edge
   * @param {number} evt.firstVisibleRowIndex - Index of the first list item at current visible screen
   * @param {number} evt.lastVisibleRowIndex - Index of the last list item at current visible screen
   * @param {Object[]} evt.visibleRowFrames - Frame info of current screen visible items
   * @param {number} evt.visibleRowFrames[].x - Current item's horizontal offset relative to ListView
   * @param {number} evt.visibleRowFrames[].y - Current item's vertical offset relative to ListView
   * @param {number} evt.visibleRowFrames[].width - Current item's width
   * @param {number} evt.visibleRowFrames[].height - Current item's height
   */
  onScroll?: (evt: {
    startEdgePos: number,
    endEdgePos: number,
    firstVisibleRowIndex: number,
    lastVisibleRowIndex: number,
    visibleRowFrames: Object
  }) => void;

  // Called when user pulls the ListView down
  onHeaderPulling?: () => void;

  // Called when user release the pulling WaterfallView
  onHeaderReleased?: () => void;

  // Called when user swipe up WaterfallView to get more data on reaching the footer
  onFooterPulling?: () => void;

  // Called when user release the getting-more-data WaterfallView
  onFooterReleased?: () => void;

  // Called on items exposed
  onExposureReport?: () => void;

  // Called on waterfall ready
  onInitialListReady?: () => void;
}

interface WaterfallViewItemProps {
  onLayout?: (e: any) => void;
  type?: number | void | undefined;
  key: string;
  style: object;
}

function WaterfallViewItem(props: WaterfallViewItemProps) {
  return (
    <li nativeName={'WaterfallItem'} {...props} />
  );
}

/**
 * Recyclable list for better performance, and lower memory usage.
 * @noInheritDoc
 */
class WaterfallView extends React.Component<WaterfallViewProps> {
  private instance: HTMLUListElement | Fiber | null = null;

  private pullHeader: PullHeader | null = null;

  private pullFooter: PullFooter | null = null;

  /**
   * @constructor
   */
  public constructor(props: WaterfallViewProps) {
    super(props);
    this.handleInitialListReady = this.handleInitialListReady.bind(this);
  }

  /**
   * Scrolls to a given index of item, either immediately, with a smooth animation.
   *
   * @param {Object} scrollToIndex params
   * @param {number} scrollToIndex.index - Scroll to specific index.
   * @param {boolean} scrollToIndex.animated - With smooth animation. By default is true.
   */
  public scrollToIndex({ index = 0, animated = true }) {
    callUIFunction(this.instance as Fiber, 'scrollToIndex', [index, index, animated]);
  }

  /**
   * Scrolls to a given x, y offset, either immediately, with a smooth animation.
   *
   * @param {Object} scrollToContentOffset params
   * @param {number} scrollToContentOffset.xOffset - Scroll to horizon offset X.
   * @param {number} scrollToContentOffset.yOffset - Scroll To vertical offset Y.
   * @param {boolean} scrollToContentOffset.animated - With smooth animation. By default is true.
   */
  public scrollToContentOffset({
    xOffset = 0,
    yOffset  = 0,
    animated = true,
  }) {
    callUIFunction(this.instance as Fiber, 'scrollToContentOffset', [xOffset, yOffset, animated]);
  }

  // Expand the PullHeaderView and display the content
  public expandPullHeader() {
    if (this.pullHeader) {
      this.pullHeader.expandPullHeader();
    }
  }

  // Collapse the PullHeaderView and hide the content
  public collapsePullHeader(options: object) {
    if (this.pullHeader) {
      this.pullHeader.collapsePullHeader(options);
    }
  }

  // Expand the PullFooterView and display the content
  public expandPullFooter() {
    if (this.pullFooter) {
      this.pullFooter.expandPullFooter();
    }
  }

  // Collapse the PullView and hide the content
  public collapsePullFooter() {
    if (this.pullFooter) {
      this.pullFooter.collapsePullFooter();
    }
  }

  public render() {
    const {
      style = {},
      renderBanner,
      numberOfColumns = 2,
      columnSpacing = 0,
      interItemSpacing = 0,
      numberOfItems = 0,
      preloadItemNumber = 0,
      renderItem,
      renderPullHeader,
      renderPullFooter,
      getItemType,
      getItemKey,
      getItemStyle,
      contentInset = { top: 0, left: 0, bottom: 0, right: 0 },
      onItemLayout,
      onHeaderPulling,
      onHeaderReleased,
      onFooterPulling,
      onFooterReleased,
      containPullHeader = false,
      containPullFooter = false,
      containBannerView = false,
      ...otherNativeProps
    } = this.props as WaterfallViewProps;

    const nativeProps = {
      ...otherNativeProps,
      style,
      numberOfColumns,
      columnSpacing,
      interItemSpacing,
      preloadItemNumber,
      contentInset,
      containPullHeader,
      containPullFooter,
      containBannerView,
    };
    const itemList: JSX.Element[] = [];

    if (typeof renderBanner === 'function') {
      const banner = renderBanner();
      if (banner) {
        if (Device.platform.OS === 'ios') {
          itemList.push((
            <View key="bannerView">
              {React.cloneElement(banner)}
            </View>
          ));
          nativeProps.containBannerView = true;
        } else if (Device.platform.OS === 'android') {
          const itemProps = {
            key: 'bannerView',
            fullSpan: true,
            style: {},
          };
          itemList.push((
            <WaterfallViewItem{...itemProps}>
              {React.cloneElement(banner)}
            </WaterfallViewItem>
          ));
        }
      }
    }

    if (typeof renderItem === 'function') {
      const pullHeader = this.getPullHeader(renderPullHeader, onHeaderPulling, onHeaderReleased);
      const pullFooter = this.getPullFooter(renderPullFooter, onFooterPulling, onFooterReleased);
      for (let index = 0; index < numberOfItems; index += 1) {
        const itemProps: WaterfallViewItemProps = {} as WaterfallViewItemProps;
        const rowChildren = renderItem(index) || null;
        this.handleRowProps(
          itemProps,
          index,
          {
            getItemKey,
            getItemStyle,
            getItemType,
            onItemLayout,
          },
        );
        if (rowChildren) {
          itemList.push((
            // @ts-ignore
            <WaterfallViewItem {...itemProps}>
              { rowChildren }
            </WaterfallViewItem>
          ));
        }
      }

      if (pullHeader) {
        itemList.unshift(pullHeader);
        nativeProps.containPullHeader = true;
      }

      if (pullFooter) {
        itemList.push(pullFooter);
        nativeProps.containPullFooter = true;
      }
      (nativeProps as WaterfallViewProps).style = {
        ...style,
      };
    } else {
      warn('Waterfall attribute [renderItem] is not Function');
    }

    return (
      // @ts-ignore
      <ul
        nativeName={'WaterfallView'}
        ref={ref => this.instance = ref}
        initialListReady={this.handleInitialListReady.bind(this)}
        {...nativeProps}
      >
        { itemList }
      </ul>
    );
  }

  /**
   * @ignore
   */
  public componentDidMount() {
    const { getItemKey } = this.props;
    if (!getItemKey) {
      warn('ListView needs getRowKey to specific the key of item');
    }
  }

  private handleRowProps(
    itemProps: WaterfallViewItemProps,
    index: number,
    { getItemKey, getItemStyle, onItemLayout, getItemType }:
    {
      getItemKey: ((index: number) => string) | undefined,
      getItemStyle: ((index: number) => HippyTypes.Style) | undefined,
      onItemLayout: ((evt: HippyTypes.LayoutEvent, index: number) => void) | undefined,
      getItemType: ((index: number) => number) | undefined,
    },
  ) {
    if (typeof getItemKey === 'function') {
      itemProps.key = getItemKey(index);
    }

    if (typeof getItemStyle === 'function') {
      itemProps.style = getItemStyle(index);
    }

    if (typeof onItemLayout === 'function') {
      itemProps.onLayout = (e: any) => {
        onItemLayout.call(this, e, index);
      };
    }

    if (typeof getItemType === 'function') {
      const type = getItemType(index);
      if (!Number.isInteger(type)) {
        warn('getRowType must return a number');
      }
      itemProps.type = type;
    }
  }

  /**
   *
   * @param renderPullHeader - PullHeader View
   * @param onHeaderPulling - Called when header is pulled
   * @param onHeaderReleased - Called when header is released
   * @private
   */
  private getPullHeader(
    renderPullHeader: undefined | (() => React.ReactElement),
    onHeaderPulling: undefined | (() => void),
    onHeaderReleased: undefined | (() => void),
  ) {
    let pullHeader: JSX.Element | null = null;
    if (typeof renderPullHeader === 'function') {
      pullHeader = (
        <PullHeader
          key={'PullHeader'}
          ref={(ref) => {
            this.pullHeader = ref;
          }}
          onHeaderPulling={onHeaderPulling}
          onHeaderReleased={onHeaderReleased}
        >
          { renderPullHeader() }
        </PullHeader>
      );
    }
    return pullHeader;
  }

  /**
   *
   * @param renderPullFooter - PullHeader View
   * @param onFooterPulling - Called when footer is pulled
   * @param onFooterReleased - Called when footer is released
   * @private
   */
  private getPullFooter(
    renderPullFooter: undefined | (() => React.ReactElement),
    onFooterPulling: undefined | (() => void),
    onFooterReleased: undefined | (() => void),
  ) {
    let pullFooter: JSX.Element | null = null;
    if (typeof renderPullFooter === 'function') {
      pullFooter = (
        <PullFooter
          key={'PullFooter'}
          ref={(ref) => {
            this.pullFooter = ref;
          }}
          onFooterPulling={onFooterPulling}
          onFooterReleased={onFooterReleased}
        >
          { renderPullFooter() }
        </PullFooter>
      );
    }
    return pullFooter;
  }

  // initialReady callback
  private handleInitialListReady() {
    const { onInitialListReady } = this.props;
    if (typeof onInitialListReady === 'function') {
      onInitialListReady();
    }
  }
}

export default WaterfallView;
