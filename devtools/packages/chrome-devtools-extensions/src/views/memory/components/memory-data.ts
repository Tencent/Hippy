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

export interface IMemoryChartPointerClickParams {
  value: string;
  axisDimension: string;
  seriesData: Array<{ value: string }>;
}

export interface IMemoryHeapMeta {
  address: string;
  file: string;
  line: number;
  size: number;
  type: string;
}

export class MemoryTableMeta {
  public size: number;
  public count: number;
  public type: string;
  public detail: Array<IMemoryHeapMeta>;
  public key: string;
  public constructor(type: string, key: string) {
    this.type = type;
    this.key = key;
    this.size = 0;
    this.count = 0;
    this.detail = new Array<IMemoryHeapMeta>();
  }
}

export interface IMemoryJsonData {
  time: string;
  heapMetas: Array<IMemoryHeapMeta>;
}

export interface ILegendselectchangedParam {
  type: 'legendselectchanged';
  // 切换的图例名称
  name: string;
  // 所有图例的选中状态表
  selected: {
    [name: string]: boolean;
  };
}

export class MemoryTabs {
  public name: string;
  public data: Array<MemoryTableMeta> | MemoryCompareData;
  public tabKey: string;
  public type: string;
  public constructor(name: string, data: Array<MemoryTableMeta> | MemoryCompareData, tabKey: string, type: string) {
    this.name = name;
    this.data = data;
    this.tabKey = tabKey;
    this.type = type;
  }
}

export class MemoryCompareData {
  public startOnly: Array<MemoryTableMeta>;
  // public both: Array<MemoryTableMeta>;
  public endOnly: Array<MemoryTableMeta>;
  public constructor(startOnly: Array<MemoryTableMeta>, endOnly: Array<MemoryTableMeta>) {
    this.startOnly = startOnly;
    // this.both = both;
    this.endOnly = endOnly;
  }
}

export const TAB_TYPE_SNAPSHOT = 'snapshot';
export const TAB_TYPE_BRUSH = 'brush';

export const CORE_MEMORY_STRING = 'core memory';

export function memoryTableRowHash(params: MemoryTableMeta): string {
  return `${params.type}-${params.count}`;
}
