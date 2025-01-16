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
import { HippyException } from '../support/common/HippyException';
import { HippyExecutor } from '../support/common/HippyExecutor';
import { VfsManager } from '../vfs/VfsManager';
import { ImageDecoderAdapter } from './components/image/ImageDecoderAdapter';
import { FontAdapter } from './components/richtext/FontAdapter';

export interface FrameworkProxy {

  destroyRoot(rootId: number): void

  // TODO(eksea)
  // getImageDecoderAdapter(): ImageDecoderAdapter

  // TODO(eksea)
  // getFontAdapter(): FontAdapter

  getVfsManager(): VfsManager

  // TODO(eksea)
  // getBackgroundExecutor(): HippyExecutor

  getBundlePath(): string

  getEngineId(): number

  onFirstPaint(): void;

  onFirstContentfulPaint(): void;

  handleNativeException(exception: HippyException): void

  updateDimension(width: number, height: number, shouldUseScreenDisplay: boolean, systemUiVisibilityChanged: boolean): void

  onSizeChanged(rootId: number, w: number, h: number, ow: number, oh: number): void
}
