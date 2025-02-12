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
import { HippyLibrary } from '../../hippy_library/HippyLibrary'
import { NativeRenderProvider } from '../../renderer_native/NativeRenderProvider'
import { HippyAny } from '../../support/common/HippyTypes'
import { PixelUtil } from '../../support/utils/PixelUtil'
import { DimensionsUtil } from '../../support/utils/DimensionsUtil'

export class NativeRenderer {
  private libHippy: HippyLibrary
  private renderProvider: NativeRenderProvider
  public instanceId: number = 0

  constructor(libHippy: HippyLibrary, enableArkCApi: boolean, renderProvider: NativeRenderProvider,
              customRenderViews: Array<string> | null, customMeasureRenderViews: Array<string> | null,
              mappingRenderViews: Array<string> | null,
              bundlePath: string, isRawfile: boolean, resModuleName: string) {
    this.libHippy = libHippy
    this.renderProvider = renderProvider
    this.instanceId = this.createNativeRenderManager(enableArkCApi, renderProvider, customRenderViews, customMeasureRenderViews, mappingRenderViews, bundlePath, isRawfile, resModuleName)
  }

  createNativeRenderManager(enableArkCApi: boolean, renderProvider: NativeRenderProvider,
                            customRenderViews: Array<string> | null, customMeasureRenderViews: Array<string> | null,
                            mappingRenderViews: Array<string> | null, bundlePath: string,
                            isRawfile: boolean, resModuleName: string): number {
    return this.libHippy?.NativeRenderer_CreateNativeRenderManager(enableArkCApi, renderProvider,
      customRenderViews, customMeasureRenderViews, mappingRenderViews, bundlePath,
      PixelUtil.getDensity(), PixelUtil.getDensityScale(), PixelUtil.getFontSizeScale(),
      isRawfile, resModuleName)
  }

  destroyNativeRenderManager() {
    this.libHippy?.NativeRenderer_DestroyNativeRenderManager(this.instanceId)
  }

  setBundlePath(bundlePath: string) {
    this.libHippy?.NativeRenderer_SetBundlePath(this.instanceId, bundlePath)
  }

  initRendererParams(statusBarHeight: number): void {
    this.libHippy?.NativeRenderer_InitRendererParams(statusBarHeight)
  }

  registerCustomFontPaths(customFontPathMap: Map<string,string> | null) : void {
    const resultArray: string[] = [];
    customFontPathMap?.forEach((value, key) => {
      resultArray.push(key, value);
    });
    this.libHippy?.NativeRenderer_RegisterFontPaths(this.instanceId, resultArray)
  }
}
