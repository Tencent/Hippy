/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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

/* eslint-disable */
import morphdom from 'morphdom';
import SizePositionManager from './size-position-manager';

const STYLE_INNER = 'position:relative; overflow:visible; width:100%; min-height:100%; will-change: transform;flex-shrink:0';
const STYLE_CONTENT = 'position:absolute; top:0; left:0;width:100%; overflow:visible;';

export  class VirtualizedList {
  constructor(container, options) {
    this.container = container;
    this.options = options;

    // Initialization
    this.state = {};
    this._initializeSizeAndPositionManager(options.rowCount);

    // Binding
    this.render = this.render.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    // Lifecycle Methods
    this.componentDidMount();
  }

  componentDidMount() {
    const {onMount, initialScrollTop, initialIndex, height} = this.options;
    const offset = (
      initialScrollTop ||
      0
    );
    const inner = this.inner = document.createElement('div');
    const content = this.content = document.createElement('div');

    inner.setAttribute('style', STYLE_INNER);
    content.setAttribute('style', STYLE_CONTENT);
    inner.appendChild(content);
    this.container.appendChild(inner);

    this.setState({
      offset,
      height,
    }, () => {
      if (offset) {
        this.container.scrollTop = offset;
      }

      // Add event listeners
      this.container.addEventListener('scroll', this.handleScroll);

      if (typeof onMount === 'function') {
        onMount();
      }
    });
  }

  _initializeSizeAndPositionManager(count) {
    this._sizeAndPositionManager = new SizePositionManager({
      itemCount: count,
      itemSizeGetter: this.getRowHeight,
      estimatedItemSize: this.options.estimatedRowHeight || 100
    });
  }

  setState(state = {}, callback) {
    this.state = Object.assign(this.state, state);

    requestAnimationFrame(() => {
      this.render();

      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  resize(height, callback) {
    this.setState({
      height,
    }, callback);
  }

  handleScroll(e) {
    const {onScroll} = this.options;
    const offset = this.container.scrollTop;

    this.setState({offset});

    if (typeof onScroll === 'function') {
      onScroll(offset, e);
    }
  }

  getRowHeight = ({index}) => {
    const {rowHeight} = this.options;

    if (typeof rowHeight === 'function') {
      return rowHeight(index);
    }

    return (Array.isArray(rowHeight)) ? rowHeight[index] : rowHeight;
  }

  getRowOffset(index) {
    const {offset} = this._sizeAndPositionManager.getSizeAndPositionForIndex(index);

    return offset;
  }
  getOffset(){
    return this.state.offset??0;
  }

  scrollToIndex(index ,animation , alignment) {
    const {height} = this.state;
    const offset = this._sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: alignment,
      containerSize: height,
      targetIndex: index,
    });
    this.container.scrollTo({top:offset,behavior:animation?'smooth':'none'});
  }
  scrollTo( offset,animation){
    if(offset<0 || offset>this._sizeAndPositionManager.getTotalSize()){
      return;
    }
    this.container.scrollTo({top:offset,behavior:animation?'smooth':'none'});
  }

  setRowCount(count) {
    this._initializeSizeAndPositionManager(count);
    this.render();
  }

  onRowsRendered(renderedRows) {
    const {onRowsRendered} = this.options;

    if (typeof onRowsRendered === 'function') {
      onRowsRendered(renderedRows);
    }
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll);
    this.container.innerHTML = '';
  }

  render() {
    const {overScanCount, renderRow} = this.options;
    const {height, offset = 0} = this.state;
    const {start, stop} = this._sizeAndPositionManager.getVisibleRange({
      containerSize: height,
      offset,
      overScanCount,
    });
    const fragment = document.createDocumentFragment();

    for (let index = start; index <= stop; index++) {
      fragment.appendChild(renderRow(index));
    }

    morphdom(this.content, fragment, {
      childrenOnly: true,
      getNodeKey: node => {
        return node.id
      },
    });

    this.onRowsRendered({
      startIndex: start,
      stopIndex: stop,
    });

    this.inner.style.height = `${this._sizeAndPositionManager.getTotalSize()}px`;
    this.content.style.top = `${this.getRowOffset(start)}px`;
  }
}
