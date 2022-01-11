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
import MListView from 'rmc-list-view';

import { formatWebStyle } from '../adapters/transfer';
import applyLayout from '../adapters/apply-layout';
import { isFunc } from '../utils/validation';

function ListViewItem(props: any) {
  const { style, height } = props;
  const itemStyle = {};
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
  scrollEndTimer: any;

  scrollBeginTimer: any;

  scrolling: boolean;

  lv: any;

  constructor(props: any) {
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
  getDataSource() {
    const { numberOfRows } = this.props;
    const dataSource = new MListView.DataSource({
      getRowData: (dataBlob, sectionID, rowID) => dataBlob[rowID],
      rowHasChanged: (row1, row2) => row1 !== row2,
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
  scrollToContentOffset(xOffset: number, yOffset: number) {
    if (this.lv as any) {
      this.lv.scrollTo(xOffset, yOffset);
    }
  }

  /**
   * @description handle list scroll event, deal with onMomentumScrollBegin and onMomentumScrollEnd
   * @param event
   */
  handleOnScroll(event: Event) {
    const {
      onScroll,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      scrollEventThrottle,
    } = this.props;
    const target = event.currentTarget || event.target;
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
  renderRow(rowData, sectionId, rowId) {
    const convertRowId = Number(rowId);
    const {
      renderRow,
      getRowStyle,
      getRowKey,
      getRowType,
      getRowHeight,
    } = this.props;
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

  render() {
    const nativeProps = Object.assign({}, this.props);

    delete nativeProps.renderRow;
    delete nativeProps.getRowType;
    delete nativeProps.getRowHeight;
    delete nativeProps.numberOfRows;
    delete nativeProps.getRowStyle;
    delete nativeProps.getRowKey;

    const newProps = Object.assign({}, nativeProps, {
      style: formatWebStyle(nativeProps.style),
    });
    return (
      <MListView
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
