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
import { HippyWModuleCreator } from '../HippyWModuleManagerImpl';
import { ConsoleWModule } from '../native/console/ConsoleWModule';
import { HippyWModuleBase } from '../native/HippyWModuleBase';
import { NetInfoWModule } from '../native/netinfo/NetInfoWModule';
import { doStartHippyModuleWorker } from './HippyModuleWorkerHelper';

export function hippyWModuleCreatorRegisterMap(): Map<string, HippyWModuleCreator> {
  let registerMap: Map<string, HippyWModuleCreator> = new Map();
  registerMap.set(ConsoleWModule.NAME, (ctx): HippyWModuleBase => new ConsoleWModule(ctx));
  registerMap.set(NetInfoWModule.NAME, (ctx): HippyWModuleBase => new NetInfoWModule(ctx));
  return registerMap;
}

doStartHippyModuleWorker(hippyWModuleCreatorRegisterMap());
