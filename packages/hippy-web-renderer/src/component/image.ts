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
  ImageResizeMode,
  NodeProps,
  InnerNodeTag,
  UIProps,
  DefaultPropsProcess,
} from '../types';
import { convertHexToRgba, hasOwnProperty, setElementStyle } from '../common';
import { HippyWebView } from './hippy-web-view';

export class Image extends HippyWebView<HTMLImageElement|HTMLElement> {
  private isLoadSuccess = false;
  private tintModeContainerDom: HTMLElement | null = null;
  private readonly renderImgDom: HTMLImageElement | null = null;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.IMAGE;
    this.dom = document.createElement('img');
    this.renderImgDom = this.dom as HTMLImageElement;
    this.handleLoad = this.handleLoad.bind(this);
    this.init();
  }

  public updateProps(
    data: UIProps,
    defaultProcess: DefaultPropsProcess,
  ) {
    if (this.firstUpdateStyle) {
      defaultProcess(this, { style: this.defaultStyle() });
      this.firstUpdateStyle = false;
    }
    if (data.style.tintColor !== undefined) {
      const newData = { ...data };
      newData.tintColor = data.style.tintColor;
      delete newData.style.tintColor;
      defaultProcess(this, newData);
      return;
    }
    defaultProcess(this, data);
  }

  public defaultStyle(): {[key: string]: any} {
    return { boxSizing: 'border-box', zIndex: 0 };
  }

  public replaceHpfile(value: string) {
    if (value && /^(hpfile):\/\//.test(value) && value.indexOf('assets') > -1) {
      return value.replace('hpfile://./', '');
    }
    return value ?? '';
  }

  public set tintColor(value) {
    this.props[NodeProps.TINY_COLOR] = value;
    if (value !== undefined && value !== 0) {
      if (this.tintModeContainerDom === null) {
        this.buildTintDomContainer();
        if (this.dom?.parentNode) {
          this.imgDomChangeContainer(this.dom?.parentNode as HTMLElement, this.tintModeContainerDom!);
        }
        return;
      }
      this.updateTintColor();
    } else {
      setElementStyle(this.dom!, { filter: '' });
    }
  }

  public get tintColor() {
    return this.props[NodeProps.TINY_COLOR];
  }

  public set capInsets(value) {
    this.props[NodeProps.CAP_INSETS] = value;
    // TODO to implement
  }

  public get capInsets() {
    return this.props[NodeProps.CAP_INSETS];
  }

  public set resizeMode(value: ImageResizeMode|undefined) {
    if (!value) {
      this.props[NodeProps.RESIZE_MODE] = ImageResizeMode.CONTAIN;
    }
    this.props[NodeProps.RESIZE_MODE] = value;
    if (this.renderImgDom && value) {
      setElementStyle(this.renderImgDom, { objectFit: ImageResizeModeToObjectFit[value] });
    }
  }

  public get resizeMode() {
    return this.props[NodeProps.RESIZE_MODE];
  }

  public get src() {
    const value = this.props[NodeProps.SOURCE];
    return this.replaceHpfile(value);
  }

  public set src(value: string) {
    if (value && this.src === value) {
      return;
    }
    value = this.replaceHpfile(value);
    this.props[NodeProps.SOURCE] = value ?? '';

    if (value && value !== this.props[NodeProps.DEFAULT_SOURCE]) {
      this.isLoadSuccess = false;
    }

    if (this.renderImgDom && !this.defaultSource) {
      this.renderImgDom.src = value ?? '';
      this.onLoadStart(null);
      return;
    }
    if (!value) {
      return;
    }
    const img = document.createElement('img');
    img.addEventListener('load', (event) => {
      if (this.src !== value) {
        return;
      }
      this.handleLoad(event, value);
    });
    img.src = value;
    this.onLoadStart(null);
  }

  public get defaultSource() {
    const value = this.props[NodeProps.DEFAULT_SOURCE];
    return this.replaceHpfile(value);
  }

  public set defaultSource(value: string) {
    value = this.replaceHpfile(value);
    this.props[NodeProps.DEFAULT_SOURCE] = value;
    if (!this.isLoadSuccess) {
      this.renderImgDom!.src = value;
    }
  }

  public onLoad(event) {
    this.props[NodeProps.ON_LOAD] && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD, event);
  }

  public onLoadStart(event) {
    this.props[NodeProps.ON_LOAD_START] && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_START, event);
  }

  public onLoadEnd(event) {
    this.props[NodeProps.ON_LOAD_END] && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_END, event);
  }

  public onError(event) {
    this.props[NodeProps.ON_ERROR] && this.context.sendUiEvent(this.id, NodeProps.ON_ERROR, event);
  }

  public onProgress(event) {
    this.props[NodeProps.ON_PROGRESS] && this.context.sendUiEvent(this.id, NodeProps.ON_PROGRESS, event);
  }

  public mounted() {
    if (this.tintModeContainerDom && this.dom !== this.tintModeContainerDom) {
      const oldParentNode = this.dom!.parentNode!;
      this.imgDomChangeContainer(oldParentNode as HTMLElement, this.tintModeContainerDom);
      this.updateTintColor();
    }
  }

  private init() {
    this.dom!.addEventListener('load', this.handleLoad);
  }

  private handleLoad(_event: Event, loadUrl?: string) {
    this.isLoadSuccess = false;
    if ((!loadUrl && this.renderImgDom?.src === this.src) || loadUrl === this.src) {
      this.onLoad({});
      if (this.renderImgDom?.src !== this.src) {
        this.renderImgDom!.src = this.src;
      }
    }
    this.onLoadEnd({});
  }

  private buildTintDomContainer() {
    this.tintModeContainerDom = document.createElement('div');
    this.tintModeContainerDom.style.overflow = 'hidden';
    this.tintModeContainerDom.style.lineHeight = '100%';
  }

  private imgDomChangeContainer(oldParent: HTMLElement, newParent: HTMLElement) {
    const realIndex = this.findDomIndex();
    oldParent.removeChild(this.dom!);
    this.dom = this.tintModeContainerDom!;
    newParent.appendChild(this.renderImgDom!);
    oldParent.insertBefore(this.dom, oldParent.childNodes[realIndex] ?? null);
    this.context.getModuleByName('UIManagerModule').defaultUpdateViewProps(this, this.props);
    this.imgDomFilterNoUseStyle();
  }

  private imgDomFilterNoUseStyle() {
    const { style } = this.props;
    if (!style) {
      return;
    }
    for (const key of Object.keys(style)) {
      if (! hasOwnProperty(style, key)) {
        return;
      }
      if (key.indexOf('width') !== -1 || key.indexOf('height') !== -1) {
        continue;
      }
      this.renderImgDom!.style[key] = '';
      this.clearBorder();
    }
  }
  private clearBorder() {
    this.renderImgDom!.style.borderStyle = '';
    this.renderImgDom!.style.borderTopStyle = '';
    this.renderImgDom!.style.borderLeftStyle = '';
    this.renderImgDom!.style.borderRightStyle = '';
    this.renderImgDom!.style.borderBottomStyle = '';
  }

  private findDomIndex() {
    let realIndex = 0;
    this.dom?.parentNode!.childNodes.forEach((item, index) => {
      if (item === this.dom) {
        realIndex = index;
      }
    });
    return realIndex;
  }

  private updateTintColor() {
    const colorValue = convertHexToRgba(this.tintColor);
    setElementStyle(this.renderImgDom!, {
      transform: 'translateX(-100%)',
      filter: `drop-shadow(${this.props.style.width}px 0 ${colorValue})`,
    });
  }
}
export const ImageResizeModeToObjectFit = (function () {
  const map = {};
  map[ImageResizeMode.CENTER] = 'none';
  map[ImageResizeMode.CONTAIN] = 'contain';
  map[ImageResizeMode.STRETCH] = 'fill';
  map[ImageResizeMode.REPEAT] = 'none';
  map[ImageResizeMode.COVER] = 'cover';
  return map;
}());


