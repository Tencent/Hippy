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
import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule';
import { HippyEngineContext } from '../../../HippyEngineContext';
import { HippyNativeModuleBase } from '../HippyNativeModuleBase';
import {
  HippyAny,

} from '../../../../support/common/HippyTypes';
import { HippyModulePromise } from '../../HippyModulePromise';


@HippyNativeModule({ name: "RootViewManager" })
export class ViewManagerModule extends HippyNativeModuleBase {
  public static readonly NAME = 'RootViewManager'
  private hippyEngineContext: HippyEngineContext;

  constructor(ctx: HippyEngineContext) {
    super(ctx)
    this.hippyEngineContext = ctx;
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'removeRootView': {
        const rootId = params[0] as number;
        this.hippyEngineContext.getNativeRenderProvider()?.getNativeRenderImpl().destroyRoot(rootId)
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }




}
