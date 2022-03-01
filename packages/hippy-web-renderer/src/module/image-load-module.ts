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

import { BaseModule, ModuleContext } from '../../types';
import { callbackToHippy } from '../common';

export class ImageLoadModule implements BaseModule {
  public static moduleName = 'ImageLoadModule';
  private context!: ModuleContext;
  public constructor(context: ModuleContext) {
    this.context = context;
  }

  public getSize(callBackId: number, url: string) {
    if (!url) {
      callbackToHippy(callBackId, `image url not support ${url}`, false, 'getSize', ImageLoadModule.moduleName);
      return;
    }

    const img = new Image();
    img.onload = () => {
      callbackToHippy(callBackId, { width: img.width, height: img.height }, false, 'getSize', ImageLoadModule.moduleName);
    };
    img.src = url;
  }

  public prefetch(callBackId: number, url: string) {
    if (!url) {
      return;
    }
    const img = new Image();
    img.src = url;
  }

  public initialize() {

  }

  public destroy() {

  }
}
