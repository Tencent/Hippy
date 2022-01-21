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

import { buildCallBackProps, ProcessType, setElementStyle } from '../../common';
import { HIPPY_COMPONENT_METHOD, NodeProps, NodeTag, ORIGIN_TYPE } from '../../module/node-def';

export enum ModalAnimationType {
  Slide = 'slide',
  Fade = 'fade',
  SlideFade = 'slide_fade',
  None = 'none',
}
export enum SupportedOrientations {
  Portrait = 'portrait',
  PortraitUpsideDown = 'portrait-upside-down',
  Landscape = 'landscape',
  LandscapeLeft = 'landscape-left',
  LandscapeRight = 'landscape-right',
}
export const ANIMATION_TIME = 200;
export const HippyModalProps = 'hippyModalProps';

export const ModalProps: ProcessType = {
  animated: animatedProcess,
  animationType: animationTypeProcess,
  supportedOrientations: supportedOrientationsProcess,
  immersionStatusBar: immersionStatusBarProcess,
  darkStatusBarText: darkStatusBarTextProcess,
  onShow: onShowProcess,
  onOrientationChange: onOrientationChangeProcess,
  onRequestClose: onRequestCloseProcess,
  transparent: transparentProcess,
  visible: visibleProcess,
};
export function initProps(el: HTMLElement) {
  el[HippyModalProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.MODAL;
  animatedProcess(el, false);
  animationTypeProcess(el, ModalAnimationType.None);
  supportedOrientationsProcess(el, SupportedOrientations.Portrait);
  immersionStatusBarProcess(el, false);
  darkStatusBarTextProcess(el, true);
  transparentProcess(el, true);
  visibleProcess(el, true);
  el[HippyModalProps][NodeProps.ON_SHOW] = null;
  el[HippyModalProps][NodeProps.ON_ORIENTATION_CHANGE] = null;
  el[HippyModalProps][NodeProps.ON_REQUEST_CLOSE] = null;
}
function animatedProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.ANIMATED] = !!value;
}
function animationTypeProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.ANIMATION_TYPE] = value;
}
function supportedOrientationsProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.SUPPORTED_ORIENTATIONS] = value;
  // TODO implement api
}
function immersionStatusBarProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.IMMERSION_STATUS_BAR] = !!value;
  // TODO implement api
}
function darkStatusBarTextProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.DARK_STATUS_BAR_TEXT] = !!value;
  // TODO implement api
}
function onShowProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyModalProps, NodeProps.ON_SHOW, nodeId);
}
function transparentProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.TRANSPARENT] = !!value;
  setElementStyle(el, {
    backgroundColor: el[HippyModalProps][NodeProps.TRANSPARENT] ? '#ffffff00' : '#fff',
  });
}
function visibleProcess(el: HTMLElement, value: string | number | boolean) {
  el[HippyModalProps][NodeProps.VISIBLE] = !!value;
  setElementStyle(el, {
    visibility: !el[HippyModalProps][NodeProps.VISIBLE] ? 'hidden' : 'visible',
  });
}
function onOrientationChangeProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, HippyModalProps, NodeProps.ON_ORIENTATION_CHANGE, nodeId);
}
function onRequestCloseProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, HippyModalProps, NodeProps.ON_REQUEST_CLOSE, nodeId);
}
export function buildModalEntryAnimationStyle(animationType: ModalAnimationType) {
  let animation = {};
  let newState = {};
  switch (animationType) {
    case ModalAnimationType.Fade:
      animation = {
        opacity: 1,
      };
      newState = { opacity: 0, transition: `opacity ${ANIMATION_TIME / 1000}s` };
      break;
    case ModalAnimationType.Slide:
      animation = {
        transform: 'translate(0vw,0vh)',
      };
      newState = {
        transform: 'translate(0vw,100vh)',
        transition: `transform ${ANIMATION_TIME / 1000}s`,
      };
      break;
    case ModalAnimationType.SlideFade:
      animation = {
        transform: 'translate(0vw,0vh)',
        opacity: 1,
      };
      newState = {
        transform: 'translate(0vw,100vh)',
        opacity: 0,
        transition: `transform ${ANIMATION_TIME / 1000}s, opacity ${ANIMATION_TIME / 1000}s`,
      };
      break;
    case ModalAnimationType.None:
      return {};
  }
  return { animation, newState };
}
export function buildModalLeaveAnimationStyle(animationType: ModalAnimationType) {
  let animation = {};
  switch (animationType) {
    case ModalAnimationType.Fade:
      animation = {
        opacity: 0,
      };
      break;
    case ModalAnimationType.Slide:
      animation = {
        transform: 'translate(0vw,100vh)',
      };
      break;
    case ModalAnimationType.SlideFade:
      animation = {
        transform: 'translate(0vw,100vh)',
        opacity: 0,
      };
      break;
    case ModalAnimationType.None:
      return {};
  }
  return animation;
}
