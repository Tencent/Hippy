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

import { ImageResizeMode, NodeProps, NodeTag } from '../../types';
import { dispatchEventToHippy, setElementStyle } from '../common';
import { View } from './view';

class Image extends View<HTMLImageElement> {
  public constructor(id: number, pId: number) {
    super(id, pId);
    this.tagName = NodeTag.VIEW;
    this.dom = document.createElement('img');
  }

  public set capInsets(value: ImageResizeMode) {
    this.props[NodeProps.CAP_INSETS] = value;
    // TODO 待实现
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

  public get source() {
    const value = this.props[NodeProps.RESIZE_MODE];
    if (value && /^(hpfile):\/\//.test(value) && value.indexOf('assets') > -1) {
      return value.replace('hpfile://./', '');
    }

    return value;
  }

  public set source(value: string) {
    this.props[NodeProps.RESIZE_MODE] = value;
    if (this.dom) {
      this.dom.src = this.source ?? '';
    }
  }

  public get defaultSource() {
    return this.props[NodeProps.DEFAULT_SOURCE];
  }

  public set defaultSource(value: string) {
    this.props[NodeProps.DEFAULT_SOURCE] = value;
  }

  public onLoad(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_LOAD, event);
  }

  public onLoadStart(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_LOAD_START, event);
  }

  public onLoadEnd(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_LOAD_END, event);
  }

  public onError(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_ERROR, event);
  }

  public onProgress(event) {
    dispatchEventToHippy(this.id, NodeProps.ON_PROGRESS, event);
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
