/* eslint-disable no-param-reassign */

import React from 'react';
import Style from '@localTypes/style';
import { Fiber } from 'react-reconciler';
import { LayoutEvent } from '@localTypes/event';
import ListViewItem, { ListViewItemProps } from './list-view-item';
import PullHeader from './pull-header';
import PullFooter from './pull-footer';
import { callUIFunction } from '../modules/ui-manager-module';
import { warn } from '../utils';
import { Device } from '../native';


type DataItem = any;

interface ListViewProps {
  /**
   * Render specific number of rows of data.
   * Set equal to dataShource.length in most case.
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
  renderRow?(
    data: DataItem,
    unknown?: any, // FIXME: What's the argument meaning?
    index?: number,
  ): React.ReactElement;

  renderPullHeader?(): React.ReactElement;

  renderPullFooter?(): React.ReactElement;

  /**
   * Each row have different type, it will be using at render recycle.
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getRowType?(index: number): number;

  /**
   * Returns the style for specific index of row.
   *
   * @param {number} index - Index Of data.
   * @returns {Object}
   */
  getRowStyle?(index: number): Style;

  /**
   * Specfic the key of row, for better data diff
   * More info: https://reactjs.org/docs/lists-and-keys.html
   *
   * @param {number} index - Index Of data.
   * @returns {string}
   */
  getRowKey?(index: number): string;

  /**
   * Is the row should sticky after scrolling up.
   * @param {number} index - Index Of data.
   * @returns {boolean}
   */
  rowShouldSticky?(index: number): boolean;
  style?: Style;

  /**
   *  Called when the `ListView` is scrolling to bottom.
   */
  onEndReached?(): void;

  /**
   * the same with onEndReached
   */
  onLoadMore? (): void

  /**
   *  Called when the row first layouting or layout changed.
   *
   * @param {Object} evt - Layout event data
   * @param {number} evt.nativeEvent.x - The position X of component
   * @param {number} evt.nativeEvent.y - The position Y of component
   * @param {number} evt.nativeEvent.width - The width of component
   * @param {number} evt.nativeEvent.hegiht - The height of component
   * @param {number} index - Index of data.
   */
  onRowLayout?(evt: LayoutEvent, index: number): void;

  /**
   * Called when the momentum scroll starts (scroll which occurs as the ListView starts gliding).
   */
  onMomentumScrollBegin?(): void;

  /**
   * Called when the momentum scroll ends (scroll which occurs as the ListView glides to a stop).
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
  onScroll?(evt: { contentOffset: { x: number, y: number }}): void; // FIXME: TS compile error.

  /**
   * Called when the user begins to drag the scroll view.
   */
  onScrollBeginDrag?(): void;

  /**
   * Called when the user stops dragging the scroll view and it either stops or begins to glide.
   */
  onScrollEndDrag?(): void;

  /**
   * android expose ability flag
   */
  exposureEventEnabled?: boolean

  /**
   * Called when user pulls the ListView down
   */
  onHeaderPulling? (): void

  /**
   * Called when user release the pulling ListView
   */
  onHeaderReleased? (): void

  /**
   * Called when user swipe up ListView to get more data on reaching the footer
   */
  onFooterPulling? (): void

  /**
   * Called when user release the getting-more-data ListView
   */
  onFooterReleased? (): void

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

interface ListItemViewProps {
  key?: string;
  type?: number | string | undefined;
  sticky?: boolean;
  style?: Style;
  onLayout?: (evt: any) => void;
  onAppear?: (index: number) => void;
  onDisappear?: (index: number) => void;
  onWillAppear?: (index: number) => void;
  onWillDisappear?: (index: number) => void;
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
  private instance: HTMLUListElement | Fiber | null = null;

  private pullHeader: PullHeader | null = null;

  private pullFooter: PullFooter | null = null;

  /**
  * @ignore
  */
  static defaultProps = {
    numberOfRows: 0,
  };

  /**
   * @ignore
   */
  constructor(props: ListViewProps) {
    super(props);
    this.handleInitialListReady = this.handleInitialListReady.bind(this);
    this.state = {
      initialListReady: false,
    };
  }

  /**
   * @ignore
   */
  public componentDidMount() {
    const { getRowKey } = this.props;
    if (!getRowKey) {
      warn('ListView needs getRowKey to specific the key of item');
    }
  }

  /**
   * change key
   */
  // eslint-disable-next-line class-methods-use-this
  private convertName(attr: string): string {
    if (Device.platform.OS === 'android' && androidAttrMap[attr]) {
      return androidAttrMap[attr];
    } if (Device.platform.OS === 'ios' && iosAttrMap[attr]) {
      return iosAttrMap[attr];
    }
    return attr;
  }

  /**
   * Scrolls to a given index of itme, either immediately, with a smooth animation.
   *
   * @param {number} xIndex - Scroll to horizon index X.
   * @param {number} yIndex - Scroll To veritical index Y.
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
   * @param {number} yOffset - Scroll To veritical offset Y.
   * @param {boolean} animated - With smooth animation.By default is true.
   */
  public scrollToContentOffset(xOffset: number, yOffset: number, animated: boolean) {
    if (typeof xOffset !== 'number' || typeof yOffset !== 'number' || typeof animated !== 'boolean') {
      return;
    }
    callUIFunction(this.instance as Fiber, 'scrollToContentOffset', [xOffset, yOffset, animated]);
  }

  /**
   * Expand the PullHeaderView and display the content
   */
  expandPullHeader() {
    if (this.pullHeader) {
      this.pullHeader.expandPullHeader();
    }
  }

  /**
   * Collapse the PullHeaderView and hide the content
   */
  collapsePullHeader() {
    if (this.pullHeader) {
      this.pullHeader.collapsePullHeader();
    }
  }

  /**
   * Expand the PullFooterView and display the content
   */
  expandPullFooter() {
    if (this.pullFooter) {
      this.pullFooter.expandPullFooter();
    }
  }

  /**
   * Collapse the PullView and hide the content
   */
  collapsePullFooter() {
    if (this.pullFooter) {
      this.pullFooter.collapsePullFooter();
    }
  }

  private handleInitialListReady() {
    this.setState({ initialListReady: true });
  }

  private getPullHeader(
    renderPullHeader: undefined | (() => React.ReactElement),
    onHeaderPulling: undefined | (() => void),
    onHeaderReleased: undefined | (() => void),
  ) {
    let pullHeader = null;
    if (typeof renderPullHeader === 'function') {
      pullHeader = (
        <PullHeader
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
  ) {
    let pullFooter = null;
    if (typeof renderPullFooter === 'function') {
      pullFooter = (
        <PullFooter
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
    { getRowKey: ((index: number) => string) | undefined,
      getRowStyle: ((index: number) => Style) | undefined,
      getRowType: ((index: number) => number) | undefined,
      onRowLayout: ((evt: LayoutEvent, index: number) => void) | undefined,
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
  /**
   * @ignore
   */
  public render() {
    const {
      children,
      style,
      renderRow,
      renderPullHeader,
      renderPullFooter,
      getRowType,
      getRowStyle,
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

    const itemList = [];
    // Deprecated: Fallback for up-forward compatible.
    if (typeof renderRow === 'function') {
      const {
        initialListReady,
      } = this.state;

      let { numberOfRows } = this.props;
      const pullHeader = this.getPullHeader(renderPullHeader, onHeaderPulling, onHeaderReleased);
      const pullFooter = this.getPullFooter(renderPullFooter, onFooterPulling, onFooterReleased);

      if (!numberOfRows && dataSource) {
        numberOfRows = dataSource.length;
      }

      if (!initialListReady) {
        numberOfRows = Math.min(numberOfRows, (initialListSize || 10));
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

        [onAppear, onDisappear, onWillAppear, onWillDisappear]
          .forEach((func) => {
            if (typeof func === 'function') {
              itemProps[this.convertName(func.name)] = () => {
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
      nativeProps.numberOfRows = itemList.length;
      (nativeProps as ListViewProps).initialListSize = initialListSize;
      (nativeProps as ListViewProps).style = {
        overflow: 'scroll',
        ...style,
      };
    }

    if (!nativeProps.onLoadMore && nativeProps.onEndReached) {
      nativeProps.onLoadMore = nativeProps.onEndReached;
    }

    return (
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
}

export default ListView;
