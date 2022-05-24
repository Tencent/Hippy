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

import React from 'react';
// @ts-ignore
import MListView, { DataSource } from '@hippy/rmc-list-view';

import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';
// @ts-ignore
import { isFunc } from '../utils/validation';

function ListViewItem(props: any) {
  const { style, height } = props;
  const itemStyle = {} as any;
  if (height) {
    itemStyle.height = height;
  }
  const newProps = Object.assign({}, props, {
    style: { ...formatWebStyle(style), ...itemStyle },
  });

  return (
    <li {...newProps} />
  );
}

/**
 * Recyclable list for better performance, and lower memory usage.
 * @noInheritDoc
 */
export class ListView extends React.Component {
  public scrollEndTimer: any;
  public scrollBeginTimer: any;
  public scrolling: boolean;
  public lv: any;

  public constructor(props: any) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.getDataSource = this.getDataSource.bind(this);
    this.handleOnScroll = this.handleOnScroll.bind(this);

    this.scrollEndTimer = '';
    this.scrollBeginTimer = '';
    this.scrolling = false;
  }

  /**
   * format dataSource as ListView.DataSource(https://reactnative.dev/docs/listviewdatasource)
   * numberOfRows not work in web
   * create dataSource [1,2,3,4,5...]
   */
  public getDataSource() {
    const { numberOfRows } = this.props as any;
    const dataSource = new DataSource({
      getRowData: (dataBlob: any, sectionID: number, rowID: number) => dataBlob[rowID],
      rowHasChanged: (row1: any, row2: any) => row1 !== row2,
    });
    const ds = Array.from(new Array(numberOfRows)).map((item, index) => index);
    return dataSource.cloneWithRows(ds);
  }

  /**
   * @TODO scroll to view
   * @description scroll to item
   * @param xIndex
   * @param yIndex
   * @param animated
   */
  // scrollToIndex(xIndex: number, yIndex: number, animated: boolean) {
  // }
  /**
   * @description scroll to Offset
   * @param xOffset
   * @param yOffset
   */
  public scrollToContentOffset(xOffset: number, yOffset: number) {
    if (this.lv as any) {
      this.lv.scrollTo(xOffset, yOffset);
    }
  }

  /**
   * @description handle list scroll event, deal with onMomentumScrollBegin and onMomentumScrollEnd
   * @param event
   */
  public handleOnScroll(event: Event) {
    const {
      onScroll,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      scrollEventThrottle,
    } = this.props as any;
    const target = event.currentTarget || event.target;
    const eventParam = {
      contentOffset: {
        x: (target as any).scrollLeft,
        y: (target as any).scrollTop,
      },
      layoutMeasurement: {
        height: (target as any).clientHeight,
        width: (target as any).clientWidth,
      },
    } as any;
    if (!this.scrolling && isFunc(onMomentumScrollBegin)) {
      this.scrolling = true;
      onMomentumScrollBegin.call(this);
    }
    if (isFunc(onScroll)) onScroll(eventParam);

    const wait = scrollEventThrottle ? scrollEventThrottle * 2 : 100;
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer);
    }
    this.scrollEndTimer = setTimeout(() => {
      if (isFunc(onMomentumScrollEnd)) onMomentumScrollEnd.call(this);
      this.scrolling = false;
    }, wait);
  }

  /**
   * @description render row container with rowId, and call props.renderRow
   * @param rowData
   * @param sectionId
   * @param rowId
   */
  public renderRow(rowData: object, sectionId: number, rowId: number) {
    const convertRowId = Number(rowId);
    const {
      renderRow,
      getRowStyle,
      getRowKey,
      getRowType,
      getRowHeight,
    } = this.props as any;
    const itemStyle = isFunc(getRowStyle) ? getRowStyle(convertRowId) : {};
    const key = isFunc(getRowKey) ? getRowKey(convertRowId) : '';
    const height = isFunc(getRowHeight) ? getRowHeight(convertRowId) : '';
    return (
      <ListViewItem
        key={key}
        style={itemStyle}
        height={height}
        type={isFunc(getRowType) ? `${getRowType(convertRowId)}` : '0'}
      >
        {renderRow(convertRowId)}
      </ListViewItem>
    );
  }

  public render() {
    const nativeProps = Object.assign({}, this.props);

    delete (nativeProps as any).renderRow;
    delete (nativeProps as any).getRowType;
    delete (nativeProps as any).getRowHeight;
    delete (nativeProps as any).numberOfRows;
    delete (nativeProps as any).getRowStyle;
    delete (nativeProps as any).getRowKey;

    const newProps = Object.assign({}, nativeProps, {
      style: formatWebStyle((nativeProps as any).style),
    });
    return (
      <MListView
        // @ts-ignore
        ref={(ref) => {
          this.lv = ref;
        }}
        {...newProps}
        dataSource={this.getDataSource()}
        renderRow={this.renderRow}
        onScroll={this.handleOnScroll}
      />
    );
  }
}

export default applyLayout(ListView);
