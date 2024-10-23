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
/* Forked from react-virtualized */
export const ALIGN_START = 'start';
export const ALIGN_CENTER = 'center';
export const ALIGN_END = 'end';

export default class SizeAndPositionManager {
  constructor({
    itemCount,
    itemSizeGetter,
    estimatedItemSize,
  }) {
    this._itemSizeGetter = itemSizeGetter;
    this._itemCount = itemCount;
    this._estimatedItemSize = estimatedItemSize;

    // Cache of size and position data for items, mapped by item index.
    this._itemSizeAndPositionData = {};

    // Measurements for items up to this index can be trusted; items afterward should be estimated.
    this._lastMeasuredIndex = -1;
  }

  getLastMeasuredIndex() {
    return this._lastMeasuredIndex;
  }

  /**
   * This method returns the size and position for the item at the specified index.
   * It just-in-time calculates (or used cached values) for items leading up to the index.
   */
  getSizeAndPositionForIndex(index) {
    if (index < 0 || index >= this._itemCount) {
      throw Error(`Requested index ${index} is outside of range 0..${this._itemCount}`);
    }

    if (index > this._lastMeasuredIndex) {
      const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
      let offset = lastMeasuredSizeAndPosition.offset
        + lastMeasuredSizeAndPosition.size;

      for (let i = this._lastMeasuredIndex + 1; i <= index; i++) {
        const size = this._itemSizeGetter({ index: i });

        if (size == null || isNaN(size)) {
          throw Error(`Invalid size returned for index ${i} of value ${size}`);
        }

        this._itemSizeAndPositionData[i] = {
          offset,
          size,
        };

        offset += size;
      }

      this._lastMeasuredIndex = index;
    }

    return this._itemSizeAndPositionData[index];
  }

  getSizeAndPositionOfLastMeasuredItem() {
    return this._lastMeasuredIndex >= 0
      ? this._itemSizeAndPositionData[this._lastMeasuredIndex]
      : { offset: 0, size: 0 };
  }

  /**
  * Total size of all items being measured.
  * This value will be completedly estimated initially.
  * As items as measured the estimate will be updated.
  */
  getTotalSize() {
    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();

    return lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size + (this._itemCount - this._lastMeasuredIndex - 1) * this._estimatedItemSize;
  }

  /**
   * Determines a new offset that ensures a certain item is visible, given the alignment.
   *
   * @param align Desired alignment within container; one of "start" (default), "center", or "end"
   * @param containerSize Size (width or height) of the container viewport
   * @return Offset to use to ensure the specified item is visible
   */
  getUpdatedOffsetForIndex({
    align = ALIGN_START,
    containerSize,
    targetIndex,
  }) {
    if (containerSize <= 0) {
      return 0;
    }

    const datum = this.getSizeAndPositionForIndex(targetIndex);
    const maxOffset = datum.offset;
    const minOffset = maxOffset - containerSize + datum.size;

    let idealOffset;

    switch (align) {
      case ALIGN_END:
        idealOffset = minOffset;
        break;
      case ALIGN_CENTER:
        idealOffset = maxOffset - (containerSize - datum.size) / 2;
        break;
      default:
        idealOffset = maxOffset;
        break;
    }

    const totalSize = this.getTotalSize();

    return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
  }

  getVisibleRange({ containerSize, offset, overscanCount }) {
    const totalSize = this.getTotalSize();

    if (totalSize === 0) {
      return {};
    }

    const maxOffset = offset + containerSize;
    let start = this._findNearestItem(offset);
    let stop = start;

    const datum = this.getSizeAndPositionForIndex(start);
    offset = datum.offset + datum.size;

    while (offset < maxOffset && stop < this._itemCount - 1) {
      stop++;
      offset += this.getSizeAndPositionForIndex(stop).size;
    }

    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      stop = Math.min(stop + overscanCount, this._itemCount);
    }

    return {
      start,
      stop,
    };
  }

  /**
   * Clear all cached values for items after the specified index.
   * This method should be called for any item that has changed its size.
   * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
   */
  resetItem(index) {
    this._lastMeasuredIndex = Math.min(this._lastMeasuredIndex, index - 1);
  }

  _binarySearch({ low, high, offset }) {
    let middle;
    let currentOffset;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      currentOffset = this.getSizeAndPositionForIndex(middle).offset;

      if (currentOffset === offset) {
        return middle;
      } if (currentOffset < offset) {
        low = middle + 1;
      } else if (currentOffset > offset) {
        high = middle - 1;
      }
    }

    if (low > 0) {
      return low - 1;
    }
  }

  _exponentialSearch({ index, offset }) {
    let interval = 1;

    while (
      index < this._itemCount
      && this.getSizeAndPositionForIndex(index).offset < offset
    ) {
      index += interval;
      interval *= 2;
    }

    return this._binarySearch({
      high: Math.min(index, this._itemCount - 1),
      low: Math.floor(index / 2),
      offset,
    });
  }

  /**
   * Searches for the item (index) nearest the specified offset.
   *
   * If no exact match is found the next lowest item index will be returned.
   * This allows partially visible items (with offsets just before/above the fold) to be visible.
   */
  _findNearestItem(offset) {
    if (isNaN(offset)) {
      throw Error(`Invalid offset ${offset} specified`);
    }

    // Our search algorithms find the nearest match at or below the specified offset.
    // So make sure the offset is at least 0 or no match will be found.
    offset = Math.max(0, offset);

    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    const lastMeasuredIndex = Math.max(0, this._lastMeasuredIndex);

    if (lastMeasuredSizeAndPosition.offset >= offset) {
      // If we've already measured items within this range just use a binary search as it's faster.
      return this._binarySearch({
        high: lastMeasuredIndex,
        low: 0,
        offset,
      });
    }
    // If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
    // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
    // The overall complexity for this approach is O(log n).
    return this._exponentialSearch({
      index: lastMeasuredIndex,
      offset,
    });
  }
}
