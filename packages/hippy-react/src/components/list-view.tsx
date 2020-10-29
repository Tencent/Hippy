import React from 'react';
import Style from '@localTypes/style';
import { LayoutEvent } from '@localTypes/event';
import ListViewItem, { ListViewItemProps } from './list-view-item';
import PullHeader from './pull-header';
import PullFooter from './pull-footer';
import { callUIFunction } from '../modules/ui-manager-module';
import { warn } from '../utils';

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
}

interface ListItemViewProps {
  key?: string;
  type?: number;
  sticky?: boolean;
  style?: Style;
  onLayout?: (evt: any) => void;
  onHeaderPulling?(): void;
  onHeaderReleased?(): void;
  onFooterPulling?(): void;
  onFooterReleased?(): void;
}

interface ListViewState {
  initialListReady: boolean;
}

/**
 * Recyclable list for better performance, and lower memory usage.
 * @noInheritDoc
 */
class ListView extends React.Component<ListViewProps, ListViewState> {
  private instance: HTMLUListElement | null = null;

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
   * Scrolls to a given index of itme, either immediately, with a smooth animation.
   *
   * @param {number} xIndex - Scroll to horizon index X.
   * @param {number} yIndex - Scroll To veritical index Y.
   * @param {boolean} animated - With smooth animation.By default is true.
   */
  public scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
    if (typeof xIndex !== 'number' || typeof yIndex !== 'number' || typeof animated !== 'boolean') {
      return;
    }
    callUIFunction(this.instance, 'scrollToIndex', [xIndex, yIndex, animated]);
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
    callUIFunction(this.instance, 'scrollToContentOffset', [xOffset, yOffset, animated]);
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
      ...nativeProps
    } = this.props;

    const itemList = [];
    // Deprecated: Fallback for up-forward compatible.
    if (typeof renderRow === 'function') {
      const {
        initialListReady,
      } = this.state;

      let { numberOfRows } = this.props;
      let pullHeader = null;
      let pullFooter = null;

      if (typeof renderPullHeader === 'function') {
        pullHeader = (
          <PullHeader
            ref={(ref) => { this.pullHeader = ref; }}
            onHeaderPulling={onHeaderPulling}
            onHeaderReleased={onHeaderReleased}
          >
            { renderPullHeader() }
          </PullHeader>
        );
      }

      if (typeof renderPullFooter === 'function') {
        pullFooter = (
          <PullFooter
            ref={(ref) => { this.pullFooter = ref; }}
            onFooterPulling={onFooterPulling}
            onFooterReleased={onFooterReleased}
          >
            { renderPullFooter() }
          </PullFooter>
        );
      }

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

      nativeProps.numberOfRows = itemList.length;
      (nativeProps as ListViewProps).initialListSize = initialListSize;
      (nativeProps as ListViewProps).style = {
        overflow: 'scroll',
        ...style,
      };
    }

    return (
      <ul
        ref={(ref) => { this.instance = ref; }}
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
