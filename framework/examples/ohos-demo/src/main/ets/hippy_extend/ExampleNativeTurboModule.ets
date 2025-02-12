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
import { HippyEngineContext } from 'hippy';
import { HippyNativeModuleBase } from 'hippy/src/main/ets/hippy_framework/modules/native';
import { HippyNativeModule } from 'hippy/src/main/ets/support/annotation/HippyNativeModule';
import { HippyAny, HippyArray, HippyMap } from 'hippy/src/main/ets/support/common/HippyTypes';
import { TurboConfig } from './turbo/TurboConfig';

@HippyNativeModule({ name: "demoTurbo" })
export class ExampleNativeTurboModule extends HippyNativeModuleBase {
  public static readonly NAME = 'demoTurbo'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  isTurbo(): boolean {
    return true
  }

  public getString(info: string): string {
    return 'demoTurbo' + info;
  }

  public getNum(num: number): number {
    return num;
  }

  public getBoolean(b: boolean): boolean {
    return b;
  }

  public getMap(map: HippyMap): HippyMap {
    return map
  }

  public getArray(array: HippyArray): HippyArray {
    return array
  }

  public getObject(obj: HippyAny): HippyAny {
    return obj
  }

  public getTurboConfig(): TurboConfig {
		return TurboConfig.getInstance();
	}

  public printTurboConfig(turboConfig: TurboConfig): string {
    return turboConfig.toString();
  }
}
