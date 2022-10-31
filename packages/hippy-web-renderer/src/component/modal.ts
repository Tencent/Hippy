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
import {
  NodeProps,
  ModalAnimationType,
  ModalOrientations,
  InnerNodeTag,
  HippyBaseView,
  UIProps, DefaultPropsProcess,
} from '../types';

import {  setElementStyle } from '../common';
import { HippyWebView } from './hippy-web-view';

export const ANIMATION_TIME = 200;
interface ModalAnimationData {
  animation?: { [key: string]: any }, newState?: { [key: string]: any }
}
enum ModalAnimationModel {
  ENTRY,
  LEAVE,
}

const DefaultEntryAnimationMap = {
  fade: {
    animation: {
      opacity: 1,
    },
    newState: { opacity: 0, transition: `opacity ${ANIMATION_TIME / 1000}s` },
  },
  slide: {
    animation: {
      transform: 'translate(0vw,0vh)',
    },
    newState: {
      transform: 'translate(0vw,100vh)',
      transition: `transform ${ANIMATION_TIME / 1000}s`,
    },
  },
  slide_fade: {
    animation: {
      transform: 'translate(0vw,0vh)',
      opacity: 1,
    },
    newState: {
      transform: 'translate(0vw,100vh)',
      opacity: 0,
      transition: `transform ${ANIMATION_TIME / 1000}s, opacity ${ANIMATION_TIME / 1000}s`,
    },
  },
  none: {
    animation: {},
    newState: {},
  },
};
const DefaultLeaveAnimationMap = {
  fade: {
    animation: {
      opacity: 0,
    },
  },
  slide: {
    animation: {
      transform: 'translate(0vw,100vh)',
    },
  },
  slide_fade: {
    animation: {
      transform: 'translate(0vw,100vh)',
      opacity: 0,
    },
  },
  none: {
    animation: {},
    newState: {},
  },
};
export class Modal extends HippyWebView<HTMLDivElement> {
  public static buildModalEntryAnimation(animationType: ModalAnimationType): ModalAnimationData {
    return DefaultEntryAnimationMap[animationType];
  }

  public static buildModalLeaveAnimation(animationType: ModalAnimationType): ModalAnimationData {
    return DefaultLeaveAnimationMap[animationType];
  }
  public entryAnimationAction: Function|undefined;
  public leaveAnimationAction: Function|undefined;
  public onBackListener;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.MODAL;
    this.dom = document.createElement('div');
    this.props[NodeProps.ANIMATED] = true;
    this.onBackListener = () => {
      this.onOrientationChange(null);
    };
  }


  public defaultStyle(): {[key: string]: any} {
    return  {
      display: 'flex',
      flexDirection: 'column',
      overflow: ' hidden',
      width: '100vw',
      height: '100vh',
      top: '0%',
      position: 'fixed',
      boxSizing: 'border-box',
    };
  }

  public updateProps(data: UIProps, defaultProcess: DefaultPropsProcess) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
    }
    const newData = { ...data };
    if (data.style?.position) {
      delete newData.style.position;
    }
    defaultProcess(this, newData);
  }

  public get animated() {
    return this.props[NodeProps.ANIMATED];
  }

  public set animated(value: boolean) {
    this.props[NodeProps.ANIMATED] = value;
  }

  public get animationType() {
    return this.props[NodeProps.ANIMATION_TYPE];
  }

  public set animationType(value: ModalAnimationType) {
    this.props[NodeProps.ANIMATION_TYPE] = value;
  }

  public get supportedOrientations() {
    return this.props[NodeProps.SUPPORTED_ORIENTATIONS];
  }

  public set supportedOrientations(value: ModalOrientations) {
    this.props[NodeProps.SUPPORTED_ORIENTATIONS] = value;
    // TODO to implement
  }

  public get immersionStatusBar() {
    return this.props[NodeProps.IMMERSION_STATUS_BAR];
  }

  public set immersionStatusBar(value: ModalOrientations) {
    this.props[NodeProps.IMMERSION_STATUS_BAR] = value;
    // TODO to implement
  }

  public get darkStatusBarText() {
    return this.props[NodeProps.DARK_STATUS_BAR_TEXT];
  }

  public set darkStatusBarText(value: ModalOrientations) {
    this.props[NodeProps.DARK_STATUS_BAR_TEXT] = value;
    // TODO to implement
  }

  public get transparent() {
    return this.props[NodeProps.TRANSPARENT];
  }

  public set transparent(value: ModalOrientations) {
    this.props[NodeProps.TRANSPARENT] = value;
    setElementStyle(this.dom!, {
      backgroundColor: this.props[NodeProps.TRANSPARENT] ? '#ffffff00' : '#fff',
    });
  }

  public onShow(value?) {
    this.props[NodeProps.ON_SHOW] && this.context.sendUiEvent(this.id, NodeProps.ON_SHOW, value);
  }

  public onOrientationChange(event) {
    this.props[NodeProps.ON_ORIENTATION_CHANGE]
    && this.context.sendUiEvent(this.id, NodeProps.ON_ORIENTATION_CHANGE, event);
  }

  public onRequestClose(value?) {
    this.props[NodeProps.ON_ORIENTATION_CHANGE]
    && this.context.sendUiEvent(this.id, NodeProps.ON_REQUEST_CLOSE, value);
    // TODO to implement
  }

  public async beforeChildMount(child: HippyBaseView, childPosition: number) {
    await super.beforeChildMount(child, childPosition);
    if (childPosition === 0 && child.dom) {
      setElementStyle(child.dom, { flex: '1', position: 'static' });
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      delete child.dom.style.top;
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      delete child.dom.style.left;
    }
  }

  public async beforeMount(parent: HippyBaseView, position: number) {
    await super.beforeMount(parent, position);
    this.entryAnimationAction = this.runAnimation(ModalAnimationModel.ENTRY, position);
    (this.context.getModuleByName('DeviceEventModule') as any).setModuleListener(this.onBackListener);
  }

  public mounted(): void {
    super.mounted();
    this.entryAnimationAction?.();
    this.onShow();
  }

  public async beforeRemove() {
    await super.beforeRemove();
    this.leaveAnimationAction = this.runAnimation(ModalAnimationModel.LEAVE, this.index);
    if (!this.leaveAnimationAction) {
      return;
    }
    await new Promise((resolve) => {
      this.leaveAnimationAction?.();
      setTimeout(() => {
        resolve(null);
      }, ANIMATION_TIME);
    });
    (this.context.getModuleByName('DeviceEventModule') as any).removeModuleListener(this.onBackListener);
  }

  private runAnimation(animationModel: ModalAnimationModel, position?: number): Function | undefined {
    if (
      this.animated
        && this.animationType !== ModalAnimationType.None && this.dom
    ) {
      const { animation, newState } = animationModel === ModalAnimationModel.ENTRY
        ? Modal.buildModalEntryAnimation(this.animationType) : Modal.buildModalLeaveAnimation(this.animationType);
      setElementStyle(this.dom, { zIndex: position, ...newState });
      return () => {
        if (this.dom) {
          setElementStyle(this.dom, animation);
        }
      };
    }
  }
}


