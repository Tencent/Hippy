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
import MListView from 'rmc-list-view';
import MPullToRefresh from 'rmc-pull-to-refresh';
import StyleSheet from '../modules/stylesheet';
import { formatWebStyle } from '../adapters/transfer';
import { isFunc } from '../utils/validation';
import { canUseDOM } from '../utils/execution-environment';
import { HIDE_SCROLLBAR_CLASS, shouldHideScrollBar } from '../adapters/hide-scrollbar';
import { LayoutEvent } from '../types';
import View from './view';

interface ListViewItemProp {
  style?: any;
  height: any;
  children?: any;
  type?: any;
  observer?: IntersectionObserver | null;
  getRowKey?: Function;
  rowShouldSticky?: (index: number) => boolean;
}

interface ListViewProps extends ListViewItemProp {
  numberOfRows?: number;
  scrollEventThrottle?: number;
  scrollEnabled?: boolean;
  showScrollIndicator?: boolean;
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
  renderPullHeader?: () => JSX.Element | JSX.Element;
  pullToRefresh?: JSX.Element;
  getPullHeaderHeight?: () => number;
  onWillAppear?: Function; // unsupported yet
  onWillDisappear?: Function; // unsupported yet
  onMomentumScrollBegin?: Function; // unsupported yet
  onMomentumScrollEnd?: Function; // unsupported yet
}

const styles = StyleSheet.create({
  scrollDisable: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    touchAction: 'none',
  },
});
let didWarn = !canUseDOM;
const setIntersectionObserve = (obserCallback: (entries: any[]) => void, observer: React.MutableRefObject<any>) => {
  if (canUseDOM && typeof window.IntersectionObserver !== 'undefined') {
    observer.current = new window.IntersectionObserver(obserCallback, {
      threshold: [0, 1],
    });
  } else if (!didWarn) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('onLayout relies on IntersectionObserver which is not supported by your browser. '
        + 'Please include a polyfill, e.g., https://github.com/w3c/IntersectionObserver/tree/main/polyfill.');
      didWarn = true;
    }
  }
};

function ListViewItem(props: ListViewItemProp) {
  const { observer, style, height, getRowKey = () => {}, rowShouldSticky } = props;
  const ref = useRef(null);
  const itemStyle: any = {};
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
    if (ref.current !== null && observer) {
      observer.observe(ref.current);
    }
  }, [ref]);

  const liElementProps = { ...props, style: { ...formatWebStyle(style), ...itemStyle } };
  delete liElementProps.observer;
  delete liElementProps.height;
  delete liElementProps.getRowKey;
  delete liElementProps.type;

  return (
    <li {...liElementProps} ref={ref} rowid={getRowKey()} />
  );
}

const ListView: React.FC<ListViewProps> = React.forwardRef((props, ref) => {
  const {
    getRowStyle, rowShouldSticky, scrollEnabled = true, showScrollIndicator = true,
    onHeaderReleased, onHeaderPulling, renderPullHeader, getPullHeaderHeight, onDisappear, onAppear,
  } = props;
  const isShowPullHeader = useRef(isFunc(getPullHeaderHeight) && isFunc(renderPullHeader));
  const pullHeaderRef = useRef(null);
  const pullHeaderHeight = useRef((isShowPullHeader.current && getPullHeaderHeight()) || 0);
  const listRef = useRef(null);
  const isPullHeaderInit = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemShowMap = useRef(new Map<any, boolean>());

  shouldHideScrollBar(!showScrollIndicator);

  const observerCallback = useCallback((entries: any[]) => {
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      const rowId = target && target.getAttribute('rowid');
      const { intersectionRatio } = entry;
      if (intersectionRatio === 1) {
        if (!itemShowMap.current.has(rowId)) {
          itemShowMap.current.set(rowId, true);
        }
        isFunc(onAppear) && onAppear(rowId);
      }
      if (intersectionRatio === 0 && itemShowMap.current.has(rowId)) {
        isFunc(onDisappear) && onDisappear(+rowId);
      }
    });
  }, [props.onAppear]);

  const observer = useRef(null);
  setIntersectionObserve(observerCallback, observer);
  useEffect(() => () => {
    observer.current && observer.current.disconnect();
  }, []);

  const renderRow = (rowData, sectionId, rowId) => {
    const convertRowId = Number(rowId);
    const { renderRow, getRowStyle, getRowKey, getRowType, getRowHeight } = props;
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
    const { numberOfRows = 0 } = props;
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

  const collapsePullHeader = () => {
    setRefreshing(false);
  };

  useImperativeHandle(ref, () => ({
    scrollToIndex,
    scrollToContentOffset,
    collapsePullHeader,
  }));

  const listViewProps = { ...props };
  if (!scrollEnabled) {
    listViewProps.style = StyleSheet.compose(props.style, styles.scrollDisable);
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


  useEffect(() => {
    // rmc-list-view pullRefresh bug
    if (isShowPullHeader.current && !isPullHeaderInit.current) {
      scrollToContentOffset(0, 1);
      scrollToContentOffset(0, 0);
      isPullHeaderInit.current = true;
    }
  }, [listRef.current]);
  const refresh = () => {
    if (isFunc(onHeaderReleased)) {
      setRefreshing(true);
      onHeaderReleased();
    }
  };

  const PullHeader = useCallback(() => {
    if (!isFunc(renderPullHeader)) {
      return (<div></div>);
    }
    return (
      <div ref={pullHeaderRef}>
        {renderPullHeader()}
      </div>
    );
  }, [props.renderPullHeader]);
  const pullIndicator = {
    get activate() {
      if (isFunc(onHeaderPulling)) {
        onHeaderPulling({ contentOffset: pullHeaderHeight.current + 1 });
      }
      return <PullHeader />;
    },
    get deactivate() {
      if (isFunc(onHeaderPulling) && pullHeaderRef.current) {
        onHeaderPulling({ contentOffset: 0 });
      }
      return <PullHeader />;
    },
    get release() {
      return <PullHeader />;
    },
    get finish() {
      return <PullHeader />;
    },
  };

  if (isShowPullHeader.current) {
    listViewProps.pullToRefresh = <MPullToRefresh
      direction='down'
      refreshing={refreshing}
      onRefresh={refresh}
      indicator={pullIndicator}
      distanceToRefresh={pullHeaderHeight.current || 100}
    />;
  }

  return (
    <View
      style={[{ flex: 1 }]}
    >
      <MListView
        {...listViewProps}
        ref={listRef}
        contentContainerStyle={isShowPullHeader.current && { marginTop: `-${pullHeaderHeight.current}px` }}
        className={(!showScrollIndicator && HIDE_SCROLLBAR_CLASS) || ''}
        dataSource={getDataSource()}
        renderRow={renderRow}
      />
    </View>
  );
});
ListView.displayName = 'ListView';
export default ListView;
