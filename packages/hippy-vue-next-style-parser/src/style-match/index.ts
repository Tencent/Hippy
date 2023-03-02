/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
/**
 * 样式匹配节点接口
 *
 * @public
 */
export interface StyleNode {
  id: string;
  pId?: number;
  tagName: string;
  classList: Set<string>;
  parentNode: StyleNode;
  nextSibling: StyleNode;
  props: any;
  attributes?: any;
}

// common map param type
export interface CommonMapParams {
  [key: string]: any;
}

/**
 * global style name
 *
 * @public
 */
export const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
 * need delete style list, when we used hmr, expired style will be push to globally dispose array
 *
 * @public
 */
export const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

export { SelectorsMap } from './css-selectors-match';
export { getCssMap } from './css-map';
