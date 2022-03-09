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

import { ImageResizeMode, NodeProps } from '../types';
import { setElementStyle } from '../common';
import { InnerNodeTag } from '../../types';
import { HippyView } from './hippy-view';

export class Image extends HippyView<HTMLImageElement> {
  private isLoadSuccess = false;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.tagName = InnerNodeTag.VIEW;
    this.dom = document.createElement('img');
  }

  public defaultStyle(): {[key: string]: any} {
    return { boxSizing: 'border-box', zIndex: 0 };
  }

  public set capInsets(value: ImageResizeMode) {
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

    return value;
  }

  public set src(value: string) {
    if (value && value !== this.props[NodeProps.DEFAULT_SOURCE]) {
      this.isLoadSuccess = false;
    }
    if (this.dom && !this.defaultSource) {
      this.dom.src = value ?? '';
      this.dom.addEventListener('load', this.handleLoad.bind(this));
    } else {
      const img = document.createElement('img');
      img.addEventListener('load', (event) => {
        if (this.src !== value) {
          return;
        }
        this.handleLoad(event, value);
      });
      img.src = value;
    }
    this.props[NodeProps.SOURCE] = value ?? '';
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
    this.context.sendUiEvent(this.id, NodeProps.ON_LOAD, event);
  }

  public onLoadStart(event) {
    this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_START, event);
  }

  public onLoadEnd(event) {
    this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_END, event);
  }

  public onError(event) {
    this.context.sendUiEvent(this.id, NodeProps.ON_ERROR, event);
  }

  public onProgress(event) {
    this.context.sendUiEvent(this.id, NodeProps.ON_PROGRESS, event);
  }
  private handleLoad(event: Event, loadUrl?: string) {
    this.isLoadSuccess = false;

    if ((!loadUrl && this.dom!.src === this.src) || loadUrl === this.src) {
      this.onLoad(event);
      if (this.dom!.src !== this.src) {
        this.dom!.src = this.src;
      }
    }
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
