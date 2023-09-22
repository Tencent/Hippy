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
/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import animateScrollTo from 'animated-scroll-to';
import MListView from '@hippy/rmc-list-view';
import MPullToRefresh from '@hippy/rmc-pull-to-refresh';
import StyleSheet from '../modules/stylesheet';
import { formatWebStyle } from '../adapters/transfer';
import { canUseDOM, isFunc, noop } from '../utils';
import { HIDE_SCROLLBAR_CLASS, shouldHideScrollBar } from '../adapters/hide-scrollbar';
import { LayoutEvent } from '../types';
import { DEFAULT_DISTANCE_TO_REFRESH, REFRESH_DISTANCE_SCREEN_Y_OFFSET } from '../constants';
import View from './view';

interface ListViewItemProps {
  style?: HippyTypes.StyleProp;
  height?: any;
  children?: any;
  type?: any;
  observer?: IntersectionObserver | null;
  getRowKey?: Function;
  rowShouldSticky?: (index: number) => boolean;
}

interface ListViewProps extends ListViewItemProps {
  horizontal?: undefined | boolean;
  numberOfRows?: number;
  scrollEventThrottle?: number;
  scrollEnabled?: boolean;
  showScrollIndicator?: boolean;
  initialContentOffset?: number;
  initialListSize?: number;
  renderRow?: Function;
  getRowStyle?: Function;
  getRowHeight?: Function;
  getRowType?: Function;
  onScroll?: (e: any) => void;
  onLayout?: (e: LayoutEvent) => void;
  onAppear?: Function;
  onDisappear?: Function;
  onHeaderReleased?: () => void;
  onHeaderPulling?: (evt: { contentOffset: number }) => void;
  onFooterReleased?: () => void;
  onFooterPulling?: (evt: { contentOffset: number }) => void;
  renderPullHeader?: () => JSX.Element | JSX.Element | null;
  renderPullFooter?: () => JSX.Element | JSX.Element | null;
  pullToRefresh?: JSX.Element;
  onWillAppear?: Function; // unsupported yet
  onWillDisappear?: Function; // unsupported yet
  onMomentumScrollBegin?: Function; // unsupported yet
  onMomentumScrollEnd?: Function; // unsupported yet
  onScrollBeginDrag?: Function; // unsupported yet
  onScrollEndDrag?: Function; // unsupported yet
  preloadItemNumber?: number; // unsupported yet
  editable?: boolean;
  delText?: string;
  onDelete?: Function;
}

const styles = StyleSheet.create({
  scrollDisable: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    touchAction: 'none',
  },
  listDefault: {
    flex: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  pullHeaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
});

let didWarn = !canUseDOM;
const setIntersectionObserve = (observeCallback: (entries: any[]) => void) => {
  let observe: null | IntersectionObserver = null;
  if (canUseDOM && typeof window.IntersectionObserver !== 'undefined') {
    observe = new window.IntersectionObserver(observeCallback, {
      threshold: [0, 1],
    });
  } else if (!didWarn) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('onLayout relies on IntersectionObserver which is not supported by your browser. '
        + 'Please include a polyfill, e.g., https://github.com/w3c/IntersectionObserver/tree/main/polyfill.');
      didWarn = true;
    }
  }
  return observe;
};

function ListViewItem(props: ListViewItemProps) {
  const { observer, style, height, getRowKey = noop, rowShouldSticky = () => false } = props;
  const listItemRef = useRef(null);
  const itemStyle: Record<string, any> = {};
  if (height) {
    itemStyle.height = height;
  }

  const key = getRowKey();
  const shouldRowSticky = (isFunc(rowShouldSticky) && rowShouldSticky(key)) || false;
  if (shouldRowSticky) {
    itemStyle.position = 'sticky';
    itemStyle.top = 0;
    itemStyle.zIndex = itemStyle.zIndex ? itemStyle.zIndex + 1 : 100;
  }

  useEffect(() => {
    if (listItemRef.current !== null && observer) {
      observer.observe(listItemRef.current);
    }
  }, [listItemRef]);

  const liElementProps = { ...props, style: { ...styles.container, ...formatWebStyle(style), ...itemStyle } };
  delete liElementProps.observer;
  delete liElementProps.height;
  delete liElementProps.getRowKey;
  delete liElementProps.type;
  delete liElementProps.rowShouldSticky;

  return (
    // @ts-ignore
    <li {...liElementProps} ref={listItemRef} rowid={getRowKey()} />
  );
}


const ListView: React.FC<ListViewProps> = React.forwardRef((props, ref) => {
  const {
    getRowStyle = noop, rowShouldSticky, scrollEnabled = true, showScrollIndicator = true,
    onHeaderReleased = noop, onHeaderPulling = noop, renderPullHeader = () => null, renderPullFooter = () => null,
    onDisappear = noop, onAppear = noop, numberOfRows = 0, onFooterPulling = noop, onFooterReleased = noop,
  } = props;

  const isShowPullHeader = useRef(isFunc(renderPullHeader) && renderPullHeader());
  const isShowPullFooter = useRef(isFunc(renderPullFooter) && renderPullFooter());
  const pullHeaderRef = useRef<null | HTMLDivElement>(null);
  const pullFooterRef = useRef<null | HTMLDivElement>(null);
  const pullHeaderOffset = useRef(0);
  const pullFooterOffset = useRef(0);
  const pullHeaderHeight = useRef(0);
  const pullFooterHeight = useRef(0);
  const collapseHeadingInProgress = useRef(false);
  const listRef = useRef<null | { ListViewRef: any }>(null);
  const isPullHeaderInit = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemShowMap = useRef(new Map<any, boolean>());

  const refreshTypes = {
    down: 'down',
    up: 'up',
    both: 'both',
  };
  const refreshType = useRef(refreshTypes.down);
  if (isShowPullHeader.current && isShowPullFooter.current) {
    refreshType.current = refreshTypes.both;
  } else if (isShowPullFooter.current) {
    refreshType.current = refreshTypes.up;
  }

  shouldHideScrollBar(!showScrollIndicator);

  const observerCallback = useCallback((entries: any[]) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      const rowId = target?.getAttribute('rowid');
      const { intersectionRatio } = entry;
      if (intersectionRatio === 1) {
        if (!itemShowMap.current.has(rowId)) {
          itemShowMap.current.set(rowId, true);
        }
        if (isFunc(onAppear)) {
          onAppear(rowId);
        }
      }
      if (intersectionRatio === 0 && itemShowMap.current.has(rowId)) {
        itemShowMap.current.delete(rowId);
        if (isFunc(onDisappear)) {
          onDisappear(Number(rowId));
        }
      }
    });
  }, [props.onAppear]);

  const observer = useRef<null | IntersectionObserver>(null);
  observer.current = setIntersectionObserve(observerCallback);
  useEffect(() => () => {
    if (observer.current) {
      observer.current.disconnect();
    }
  }, []);

  const renderRow = (rowData, sectionId, rowId) => {
    const convertRowId = Number(rowId);
    const { renderRow = () => null, getRowStyle = () => ({}), getRowKey = () => '', getRowType = () => '0', getRowHeight = () => 0 } = props;
    const itemStyle = isFunc(getRowStyle) ? getRowStyle(convertRowId) : {};
    const key = isFunc(getRowKey) ? getRowKey(convertRowId) : '';
    const height = isFunc(getRowHeight) ? getRowHeight(convertRowId) : '';
    return (
      <ListViewItem
        observer={observer.current}
        key={key}
        getRowKey={() => convertRowId}
        style={itemStyle}
        height={height}
        rowShouldSticky={rowShouldSticky}
        type={isFunc(getRowType) ? `${getRowType(convertRowId)}` : '0'}
      >
        {renderRow(convertRowId)}
      </ListViewItem>
    );
  };

  const getDataSource = () => {
    const dataSource = new MListView.DataSource({
      getRowData: (dataBlob, sectionID, rowID) => dataBlob[rowID],
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    const ds = Array.from(new Array(numberOfRows)).map((item, index) => index);
    return dataSource.cloneWithRows(ds);
  };

  // component methods
  const scrollToIndex = (xIndex: number, yIndex: number, animated: boolean) => {
    const style = getRowStyle();
    const height = style?.height || 0;
    const width = style?.width || 0;
    const node = listRef.current?.ListViewRef?.ScrollViewRef;
    if (animated) {
      animateScrollTo([xIndex * width, yIndex * height], {
        elementToScroll: node,
      });
    } else {
      listRef.current?.ListViewRef?.scrollTo(xIndex * width, yIndex * height);
    }
  };

  const scrollToContentOffset = (xOffset: number, yOffset: number) => {
    listRef.current?.ListViewRef?.scrollTo(xOffset, yOffset);
  };

  const collapsePullHeader = (options: { time?: number } = { time: 0 }) => {
    const { time } = options;
    if (collapseHeadingInProgress.current) {
      return;
    }
    collapseHeadingInProgress.current = true;
    if (time === 0) {
      setRefreshing(false);
      collapseHeadingInProgress.current = false;
    } else {
      setTimeout(() => {
        setRefreshing(false);
        collapseHeadingInProgress.current = false;
      }, time);
    }
  };

  const collapsePullFooter = () => {
    setRefreshing(false);
  };

  useImperativeHandle(ref, () => ({
    scrollToIndex,
    scrollToContentOffset,
    collapsePullHeader,
    collapsePullFooter,
  }));

  const listViewProps = { ...props };
  listViewProps.style = StyleSheet.compose(styles.listDefault, props.style);
  if (!scrollEnabled) {
    listViewProps.style = StyleSheet.compose(listViewProps.style, styles.scrollDisable);
  }

  // delete ListView unsupported prop
  delete listViewProps.renderRow;
  delete listViewProps.getRowType;
  delete listViewProps.getRowHeight;
  delete listViewProps.numberOfRows;
  delete listViewProps.getRowStyle;
  delete listViewProps.getRowKey;
  delete listViewProps.onAppear;
  delete listViewProps.onDisappear;
  delete listViewProps.onWillAppear;
  delete listViewProps.onWillDisappear;
  delete listViewProps.onMomentumScrollBegin;
  delete listViewProps.onMomentumScrollEnd;
  delete listViewProps.onScrollBeginDrag;
  delete listViewProps.onScrollEndDrag;
  delete listViewProps.preloadItemNumber;
  delete listViewProps.editable;
  delete listViewProps.delText;
  delete listViewProps.onDelete;
  delete listViewProps.initialListSize;

  const fixRmcListViewBug = () => {
    // rmc-list-view pullRefresh bug
    if (isShowPullHeader.current && !isPullHeaderInit.current) {
      scrollToContentOffset(0, 1);
      scrollToContentOffset(0, 0);
      isPullHeaderInit.current = true;
    }
  };
  useEffect(() => {
    fixRmcListViewBug();
  }, [listRef.current]);
  const refresh = () => {
    if (isFunc(onHeaderReleased)) {
      setRefreshing(true);
      onHeaderReleased();
    }
  };
  const onFooterRefresh = () => {
    if (isFunc(onFooterReleased)) {
      setRefreshing(true);
      onFooterReleased();
    }
  };

  const PullHeader = useCallback(() => {
    if (!isShowPullHeader.current) {
      return null;
    }
    React.useEffect(() => {
      if (pullHeaderRef.current) {
        const headerRect = pullHeaderRef.current.getBoundingClientRect();
        pullHeaderHeight.current = headerRect.height;
      }
    }, [pullHeaderRef]);
    return (
      // @ts-ignore
      <div ref={pullHeaderRef} style={styles.pullHeaderContainer}>
        {renderPullHeader()}
      </div>
    );
  }, [props.renderPullHeader]);

  const PullFooter = useCallback(() => {
    if (!isShowPullFooter) {
      return null;
    }
    React.useEffect(() => {
      if (pullFooterRef.current) {
        const footerRect = pullFooterRef.current.getBoundingClientRect();
        pullFooterHeight.current = footerRect.height;
      }
    }, [pullFooterRef]);
    return (
      // @ts-ignore
      <div ref={pullFooterRef} style={styles.pullHeaderContainer}>
        { renderPullFooter() }
      </div>
    );
  }, [props.renderPullFooter]);

  const pullIndicator = {
    get activate() {
      let currentOffset = 0;
      if (pullHeaderRef.current) {
        currentOffset = pullHeaderRef.current.getClientRects()[0].y;
      }
      if (
        isFunc(onHeaderPulling)
        && pullHeaderHeight.current > 0
        && currentOffset !== pullHeaderOffset.current
      ) {
        pullHeaderOffset.current = currentOffset;
        onHeaderPulling({ contentOffset: pullHeaderHeight.current + REFRESH_DISTANCE_SCREEN_Y_OFFSET });
      }
      return <PullHeader />;
    },
    get deactivate() {
      return <PullHeader />;
    },
    get release() {
      return <PullHeader />;
    },
    get finish() {
      return <PullHeader />;
    },
  };

  const pullFooterIndicator = {
    get activate() {
      let currentOffset = 0;
      if (pullFooterRef.current) {
        currentOffset = pullFooterRef.current.getClientRects()[0].y;
      }
      if (
        isFunc(onFooterPulling)
        && pullFooterOffset.current > 0
        && currentOffset !== pullFooterOffset.current
      ) {
        pullFooterOffset.current = currentOffset;
        onFooterPulling({ contentOffset: pullFooterOffset.current + REFRESH_DISTANCE_SCREEN_Y_OFFSET });
      }
      return <PullFooter />;
    },
    get deactivate() {
      return <PullFooter />;
    },
    get release() {
      return <PullFooter />;
    },
    get finish() {
      return <PullFooter />;
    },
  };

  if (isShowPullHeader.current || isShowPullFooter.current) {
    listViewProps.pullToRefresh = <MPullToRefresh
      direction={refreshType.current}
      refreshing={refreshing}
      onRefresh={refreshType.current === refreshTypes.up ? onFooterRefresh : refresh}
      onFooterRefresh={onFooterRefresh}
      indicator={refreshType.current === refreshTypes.up ? pullFooterIndicator : pullIndicator}
      footerIndicator={pullFooterIndicator}
      indicatorHeight={pullHeaderHeight.current}
      footerIndicatorHeight={pullFooterHeight.current}
      distanceToRefresh={
        pullHeaderHeight.current
          ?  pullHeaderHeight.current -  REFRESH_DISTANCE_SCREEN_Y_OFFSET : DEFAULT_DISTANCE_TO_REFRESH
      }
    />;
  }

  return (
    <View
      style={[{ flex: 1 }]}
    >
      <MListView
        {...listViewProps}
        contentContainerStyle={{ position: 'relative' }}
        ref={listRef}
        className={(!showScrollIndicator && HIDE_SCROLLBAR_CLASS) || ''}
        dataSource={getDataSource()}
        initialListSize={numberOfRows}
        renderRow={renderRow}
      />
    </View>
  );
});
ListView.displayName = 'ListView';
export default ListView;
