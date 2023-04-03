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
import { Device } from '../native';
import ListViewItem, { ListViewItemProps } from './list-view-item';
import PullHeader from './pull-header';
import PullFooter from './pull-footer';

type DataItem = any;

interface ListViewProps {
  /**
   * Render specific number of rows of data.
   * Set equal to dataSource.length in most case.
   */
  numberOfRows: number;

  /**
   * Data source
   */
  dataSource: DataItem[];

  /**
   * Specfic how many data will render at first screen.
   */
  initialListSize?: number;

  /**
   * Scroll to offset after `ListView` with data rendered.
   */
  initialContentOffset?: number;

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
  scrollEventThrottle: number;

  /**
   * When `true`, shows a horizon scroll indicator.
   * The default value is `true`.
   */
  showScrollIndicator?: boolean;

  /**
   * Passing the data and returns the row component.
   *
   * @param {Object} data - Data for row rendering
   * @param {null} unknown - seems null.
   * @param {number} index - Index Of data.
   * @returns {React.Component}
   */
  renderRow?: (
    data: DataItem,
    unknown?: any, // FIXME: What's the argument meaning?
    index?: number,
  ) => React.ReactElement;

  renderPullHeader?: () => React.ReactElement;

  renderPullFooter?: () => React.ReactElement;

  /**
   * Each row have different type, it will be using at render recycle.
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getRowType?: (index: number) => number;

  /**
   * Returns the style for specific index of row.
   *
   * @param {number} index - Index Of data.
   * @returns {Object}
   */
  getRowStyle?: (index: number) => HippyTypes.Style;

  /**
   * Returns the style for PullHeader.
   *
   * @param {number} index - Index Of data.
   * @returns {Object}
   */
  getHeaderStyle?: () => HippyTypes.Style;

  /**
   * Returns the style for PullFooter.
   *
   * @param {number} index - Index Of data.
   * @returns {Object}
   */
  getFooterStyle?: () => HippyTypes.Style;

  /**
   * Specfic the key of row, for better data diff
   * More info: https://reactjs.org/docs/lists-and-keys.html
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getRowKey?: (index: number) => string;

  /**
   * Is the row should sticky after scrolling up.
   * @param {number} index - Index Of data.
   * @returns {boolean}
   */
  rowShouldSticky?: (index: number) => boolean;
  style?: HippyTypes.Style;

  /**
   *  Called when the `ListView` is scrolling to bottom.
   */
  onEndReached?: () => void;

  /**
   * the same with onEndReached
   */
  onLoadMore?: () => void

  /**
   *  Called when the row first layouting or layout changed.
   *
   * @param {Object} evt - Layout event data
   * @param {number} evt.x - The position X of component
   * @param {number} evt.y - The position Y of component
   * @param {number} evt.width - The width of component
   * @param {number} evt.height - The height of component
   * @param {number} index - Index of data.
   */
  onRowLayout?: (evt: HippyTypes.LayoutEvent, index: number) => void;

  /**
   * Called when the momentum scroll starts (scroll which occurs as the ListView starts gliding).
   */
  onMomentumScrollBegin?: () => void;

  /**
   * Called when the momentum scroll ends (scroll which occurs as the ListView glides to a stop).
   */
  onMomentumScrollEnd?: () => void;

  /**
   * Fires at most once per frame during scrolling.
   * The frequency of the events can be controlled using the `scrollEventThrottle` prop.
   *
   * @param {Object} evt - Scroll event data.
   * @param {number} evt.contentOffset.x - Offset X of scrolling.
   * @param {number} evt.contentOffset.y - Offset Y of scrolling.
   */
  onScroll?: (evt: { contentOffset: { x: number, y: number }}) => void;

  /**
   * Called when the user begins to drag the scroll view.
   */
  onScrollBeginDrag?: () => void;

  /**
   * Called when the user stops dragging the scroll view and it either stops or begins to glide.
   */
  onScrollEndDrag?: () => void;

  /**
   * android expose ability flag
   */
  exposureEventEnabled?: boolean

  /**
   * Called when user pulls the ListView down
   */
  onHeaderPulling?: () => void

  /**
   * Called when user release the pulling ListView
   */
  onHeaderReleased?: () => void

  /**
   * Called when user swipe up ListView to get more data on reaching the footer
   */
  onFooterPulling?: () => void

  /**
   * Called when user release the getting-more-data ListView
   */
  onFooterReleased?: () => void

  /**
   * Called when a whole new list item appears
   */
  onAppear?: (index: number) => void

  /**
   * Called when a whole list item disappears
   */
  onDisappear?: (index: number) => void

  /**
   * Called when a new list item will appear(1 px)
   */
  onWillAppear?: (index: number) => void

  /**
   * Called when a new list item will disappear(1 px)
   */
  onWillDisappear?: (index: number) => void
}

interface ListViewState {
  initialListReady: boolean;
}

interface AttrMap {
  [propName: string]: string;
}

const androidAttrMap: AttrMap = {
  onDisappear: 'onDisAppear',
};
const iosAttrMap: AttrMap = {
  onDisappear: 'onDisappear',
};

/**
 * Recyclable list for better performance, and lower memory usage.
 * @noInheritDoc
 */
class ListView extends React.Component<ListViewProps, ListViewState> {
  private static defaultProps = {
    numberOfRows: 0,
  };
  /**
   * change key
   */
  private static convertName(functionName: string): string {
    if (Device.platform.OS === 'android' && androidAttrMap[functionName]) {
      return androidAttrMap[functionName];
    } if (Device.platform.OS === 'ios' && iosAttrMap[functionName]) {
      return iosAttrMap[functionName];
    }
    return functionName;
  }
  private instance: HTMLUListElement | Fiber | null = null;
  private pullHeader: PullHeader | null = null;
  private pullFooter: PullFooter | null = null;

  public constructor(props: ListViewProps) {
    super(props);
    this.handleInitialListReady = this.handleInitialListReady.bind(this);
    this.state = {
      initialListReady: false,
    };
  }

  public componentDidMount() {
    const { getRowKey } = this.props;
    if (!getRowKey) {
      warn('ListView needs getRowKey to specific the key of item');
    }
  }

  /**
   * Scrolls to a given index of item, either immediately, with a smooth animation.
   *
   * @param {number} xIndex - Scroll to horizon index X.
   * @param {number} yIndex - Scroll To vertical index Y.
   * @param {boolean} animated - With smooth animation.By default is true.
   */
  public scrollToIndex(xIndex: number | undefined, yIndex: number | undefined, animated: boolean | undefined) {
    if (typeof xIndex !== 'number' || typeof yIndex !== 'number' || typeof animated !== 'boolean') {
      return;
    }
    callUIFunction(this.instance as Fiber, 'scrollToIndex', [xIndex, yIndex, animated]);
  }

  /**
   * Scrolls to a given x, y offset, either immediately, with a smooth animation.
   *
   * @param {number} xOffset - Scroll to horizon offset X.
   * @param {number} yOffset - Scroll To vertical offset Y.
   * @param {boolean} animated - With smooth animation.By default is true.
   */
  public scrollToContentOffset(
    xOffset: number | undefined,
    yOffset: number | undefined,
    animated: boolean | undefined,
  ) {
    if (typeof xOffset !== 'number' || typeof yOffset !== 'number' || typeof animated !== 'boolean') {
      return;
    }
    callUIFunction(this.instance as Fiber, 'scrollToContentOffset', [xOffset, yOffset, animated]);
  }

  /**
   * Expand the PullHeaderView and display the content
   */
  public expandPullHeader() {
    if (this.pullHeader) {
      this.pullHeader.expandPullHeader();
    }
  }

  /**
   * Collapse the PullHeaderView and hide the content
   */
  public collapsePullHeader(options: object) {
    if (this.pullHeader) {
      this.pullHeader.collapsePullHeader(options);
    }
  }

  /**
   * Expand the PullFooterView and display the content
   */
  public expandPullFooter() {
    if (this.pullFooter) {
      this.pullFooter.expandPullFooter();
    }
  }

  /**
   * Collapse the PullView and hide the content
   */
  public collapsePullFooter() {
    if (this.pullFooter) {
      this.pullFooter.collapsePullFooter();
    }
  }

  public render() {
    const {
      children,
      style,
      renderRow,
      renderPullHeader,
      renderPullFooter,
      getRowType,
      getRowStyle,
      getHeaderStyle,
      getFooterStyle,
      getRowKey,
      dataSource,
      initialListSize,
      rowShouldSticky,
      onRowLayout,
      onHeaderPulling,
      onHeaderReleased,
      onFooterPulling,
      onFooterReleased,
      onAppear,
      onDisappear,
      onWillAppear,
      onWillDisappear,
      ...nativeProps
    } = this.props;
    const itemList: JSX.Element[] = [];
    if (typeof renderRow === 'function') {
      const {
        initialListReady,
      } = this.state;
      let { numberOfRows } = this.props;
      const pullHeader = this.getPullHeader(renderPullHeader, onHeaderPulling, onHeaderReleased, getHeaderStyle);
      const pullFooter = this.getPullFooter(renderPullFooter, onFooterPulling, onFooterReleased, getFooterStyle);
      if (!numberOfRows && dataSource) {
        numberOfRows = dataSource.length;
      }
      if (!initialListReady) {
        numberOfRows = Math.min(numberOfRows, (initialListSize || 15));
      }
      for (let index = 0; index < numberOfRows; index += 1) {
        const itemProps: ListViewItemProps = {};
        let rowChildren;
        if (dataSource) {
          rowChildren = renderRow(dataSource[index], null, index);
        } else {
          rowChildren = renderRow(index);
        }

        this.handleRowProps(itemProps, index, { getRowKey, getRowStyle, getRowType, onRowLayout, rowShouldSticky });

        [
          { func: onAppear, name: 'onAppear' },
          { func: onDisappear, name: 'onDisappear' },
          { func: onWillAppear, name: 'onWillAppear' },
          { func: onWillDisappear, name: 'onWillDisappear' },
        ].forEach(({ func, name }) => {
          if (typeof func === 'function') {
            itemProps[ListView.convertName(name)] = () => {
              func(index);
            };
          }
        });
        if (rowChildren) {
          itemList.push((
            <ListViewItem {...itemProps}>
              {rowChildren}
            </ListViewItem>
          ));
        }
      }
      if (pullHeader) {
        itemList.unshift(pullHeader);
      }
      if (pullFooter) {
        itemList.push(pullFooter);
      }
      if (typeof rowShouldSticky === 'function') {
        Object.assign(nativeProps, {
          rowShouldSticky: true,
        });
      }
      const appearEventList = [onAppear, onDisappear, onWillAppear, onWillDisappear];
      nativeProps.exposureEventEnabled = appearEventList.some(func => typeof func === 'function');
      if (Device.platform.OS === 'ios') {
        nativeProps.numberOfRows = itemList.length;
      }
      if (typeof initialListSize !== 'undefined') {
        (nativeProps as ListViewProps).initialListSize = initialListSize;
      }
      (nativeProps as ListViewProps).style = {
        overflow: 'scroll',
        ...style,
      };
    }

    return (
      // @ts-ignore
      <ul
        ref={(ref) => {
          this.instance = ref;
        }}
        nativeName="ListView"
        initialListReady={this.handleInitialListReady}
        {...nativeProps}
      >
        {itemList.length ? itemList : children}
      </ul>
    );
  }

  private handleInitialListReady() {
    this.setState({ initialListReady: true });
  }

  private getPullHeader(
    renderPullHeader: undefined | (() => React.ReactElement),
    onHeaderPulling: undefined | (() => void),
    onHeaderReleased: undefined | (() => void),
    getHeaderStyle: undefined | (() => any),
  ) {
    let pullHeader: JSX.Element | null = null;
    let style = {};
    if (typeof getHeaderStyle === 'function') {
      style = getHeaderStyle();
    }
    if (typeof renderPullHeader === 'function') {
      pullHeader = (
        <PullHeader
          // @ts-ignore
          style={style}
          key={'pull-header'}
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

  private getPullFooter(
    renderPullFooter: undefined | (() => React.ReactElement),
    onFooterPulling: undefined | (() => void),
    onFooterReleased: undefined | (() => void),
    getFooterStyle: undefined | (() => any),
  ) {
    let pullFooter: JSX.Element | null = null;
    let style = {};
    if (typeof getFooterStyle === 'function') {
      style = getFooterStyle();
    }
    if (typeof renderPullFooter === 'function') {
      pullFooter = (
        <PullFooter
          // @ts-ignore
          style={style}
          key={'pull-footer'}
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

  private handleRowProps(
    itemProps: ListViewItemProps,
    index: number,
    { getRowKey, getRowStyle, onRowLayout, getRowType, rowShouldSticky }:
    {
      getRowKey: ((index: number) => string) | undefined,
      getRowStyle: ((index: number) => HippyTypes.Style) | undefined,
      getRowType: ((index: number) => number) | undefined,
      onRowLayout: ((evt: HippyTypes.LayoutEvent, index: number) => void) | undefined,
      rowShouldSticky: ((index: number) => boolean) | undefined,
    },
  ) {
    if (typeof getRowKey === 'function') {
      itemProps.key = getRowKey(index);
    }

    if (typeof getRowStyle === 'function') {
      itemProps.style = getRowStyle(index);
    }

    if (typeof onRowLayout === 'function') {
      itemProps.onLayout = (e: any) => {
        onRowLayout(e, index);
      };
    }

    if (typeof getRowType === 'function') {
      const type = getRowType(index);
      if (!Number.isInteger(type)) {
        warn('getRowType must returns a number');
      }
      itemProps.type = type;
    }

    if (typeof rowShouldSticky === 'function') {
      itemProps.sticky = rowShouldSticky(index);
    }
  }
}

export default ListView;
