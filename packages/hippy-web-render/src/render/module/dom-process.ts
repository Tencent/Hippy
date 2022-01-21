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

import { CommonProps, createHippyView } from '../component/view';
import { createHippyScrollView, ScrollViewProps } from '../component/scroll-view';
import {
  createHippyListItemView,
  createHippyListView,
  ListViewProps,
} from '../component/list';
import {
  createHippyRefreshWrapper,
  RefreshWrapperProps,
} from '../component/refresh-wrapper';
import { TextInputProps } from '../component/text-input/process';
import { ModalProps } from '../component/modal/process';
import {
  createHippyViewPager,
  createHippyViewPagerItem,
  ViewPagerProps,
} from '../component/view-pager';
import { TextProps, createText } from '../component/text';
import { ImgProps, createImage } from '../component/image';
import { setElementProps, transformForColor } from '../common';
import { createHippyModal } from '../component/modal';
import { createHippyTextInput } from '../component/text-input';
import { CElementConfig, ElementProps, NodeTag, ORIGIN_TYPE } from './node-def';

export const ComponentMap: {
  [key: string]: { builder: CElementConfig; processProps: Function };
} = (function () {
  function packageConfig(create: Function, propsFilter?: Function|null) {
    return {
      create,
      propsFilter,
    };
  }
  function textInputFilter(props: any) {
    if (props.style?.placeholderTextColor) {
      props.placeholderTextColor = transformForColor(props.style.placeholderTextColor);
      delete props.style.placeholderTextColor;
    }
  }
  function scrollViewFilter(props: any) {
    if (props.style.flexShrink === 1 && props.style.flexGrow === 1 && !props.style.flexBasis) {
      delete props.style.flexShrink;
      delete props.style.flexGrow;
    }
  }
  const map = {};
  map[NodeTag.VIEW] = { builder: packageConfig(createHippyView), processProps: viewProcessProps };
  map[NodeTag.LIST_ITEM] = {
    builder: packageConfig(createHippyListItemView),
    processProps: viewProcessProps,
  };
  map[NodeTag.LIST] = {
    builder: packageConfig(createHippyListView),
    processProps: listViewProcessProps,
  };
  map[NodeTag.TEXT] = { builder: packageConfig(createText), processProps: textProcessProps };
  map[NodeTag.IMAGE] = { builder: packageConfig(createImage), processProps: imgProcessProps };
  map[NodeTag.SCROLL_VIEW] = {
    builder: packageConfig(createHippyScrollView, scrollViewFilter),
    processProps: scrollViewProcessProps,
  };
  map[NodeTag.VIEW_PAGER] = {
    builder: packageConfig(createHippyViewPager),
    processProps: viewPagerProcessProps,
  };
  map[NodeTag.VIEW_PAGER_ITEM] = {
    builder: packageConfig(createHippyViewPagerItem),
    processProps: viewProcessProps,
  };
  map[NodeTag.REFRESH] = {
    builder: packageConfig(createHippyRefreshWrapper),
    processProps: refreshProcessProps,
  };
  map[NodeTag.MODAL] = {
    builder: packageConfig(createHippyModal),
    processProps: modalProcessProps,
  };
  map[NodeTag.REFRESH_ITEM] = {
    builder: packageConfig((id: number, props: any) => createBaseElement('div', props, NodeTag.REFRESH_ITEM, id)),
    processProps: commonProcessProps,
  };
  map[NodeTag.TEXT_INPUT] = {
    builder: packageConfig(createHippyTextInput, textInputFilter),
    processProps: textInputProcessProps,
  };
  return map;
}());

function createBaseElement(tag: string, props: ElementProps, type: NodeTag, id: number) {
  const el = document.createElement(tag);
  setElementProps(el, props, type, id);
  el[ORIGIN_TYPE] = type;
  return el;
}

function textProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
  fromUpdate = false,
) {
  if (TextProps[propsKey]) {
    TextProps[propsKey](el, value, nodeId, fromUpdate);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function imgProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (ImgProps[propsKey]) {
    ImgProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function scrollViewProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (ScrollViewProps[propsKey]) {
    ScrollViewProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function viewPagerProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (ViewPagerProps[propsKey]) {
    ViewPagerProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function viewProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  commonProcessProps(el, propsKey, value, nodeId);
}
function listViewProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (ListViewProps[propsKey]) {
    ListViewProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function refreshProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (RefreshWrapperProps[propsKey]) {
    RefreshWrapperProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function textInputProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (TextInputProps[propsKey]) {
    TextInputProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function modalProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (ModalProps[propsKey]) {
    ModalProps[propsKey](el, value, nodeId);
    return;
  }
  commonProcessProps(el, propsKey, value, nodeId);
}
function commonProcessProps(
  el: HTMLElement,
  propsKey: string,
  value: string | number | boolean,
  nodeId: number,
) {
  if (CommonProps[propsKey]) {
    CommonProps[propsKey](el, value, nodeId);
  }
}
