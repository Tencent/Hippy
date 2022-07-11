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

import { ImageResizeMode, NodeProps, InnerNodeTag, UIProps, HippyBaseView } from '../types';
import { convertHexToRgbaArray, setElementStyle } from '../common';
import { Color, Solver } from '../third-lib/color-transform.js';
import { HippyWebView } from './hippy-web-view';

export class Image extends HippyWebView<HTMLImageElement> {
  private isLoadSuccess = false;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.IMAGE;
    this.dom = document.createElement('img');
    this.handleLoad = this.handleLoad.bind(this);
    this.init();
  }

  public updateProps(
    data: UIProps,
    defaultProcess: (component: HippyBaseView, data: UIProps) => void,
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

  public set tintColor(value) {
    this.props[NodeProps.TINY_COLOR] = value;
    if (value !== undefined && value !== 0) {
      const [red, blue, green] = convertHexToRgbaArray(value);
      const color = new Color(red, blue, green);
      const solver = new Solver(color);
      const filter = solver.solve();
      setElementStyle(this.dom!, { filter: filter.filter, willChange: 'auto' });
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
    if (this.dom && value) {
      setElementStyle(this.dom, { objectFit: ImageResizeModeToObjectFit[value] });
    }
  }

  public get resizeMode() {
    return this.props[NodeProps.RESIZE_MODE];
  }

  public get src() {
    const value = this.props[NodeProps.SOURCE];
    if (value && /^(hpfile):\/\//.test(value) && value.indexOf('assets') > -1) {
      return value.replace('hpfile://./', '');
    }

    return value ?? '';
  }

  public set src(value: string) {
    if (value && this.src === value) {
      return;
    }
    this.props[NodeProps.SOURCE] = value ?? '';

    if (value && value !== this.props[NodeProps.DEFAULT_SOURCE]) {
      this.isLoadSuccess = false;
    }

    if (this.dom && !this.defaultSource) {
      this.dom.src = value ?? '';
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
    return this.props[NodeProps.DEFAULT_SOURCE];
  }

  public set defaultSource(value: string) {
    this.props[NodeProps.DEFAULT_SOURCE] = value;
    if (!this.isLoadSuccess) {
      this.dom!.src = value;
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

  private init() {
    this.dom!.addEventListener('load', this.handleLoad);
  }

  private handleLoad(_event: Event, loadUrl?: string) {
    this.isLoadSuccess = false;

    if ((!loadUrl && this.dom?.src === this.src) || loadUrl === this.src) {
      this.onLoad(null);
      if (this.dom?.src !== this.src) {
        this.dom!.src = this.src;
      }
    }
    this.onLoadEnd(null);
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


