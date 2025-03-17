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
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import hilog from '@ohos.hilog';
import Want from '@ohos.app.ability.Want';
import window from '@ohos.window';
import UIAbility from '@ohos.app.ability.UIAbility';
import libHippy from 'libhippy.so'
import font from '@ohos.font';
import { EngineInitParams } from 'hippy';
import { BusinessError } from '@kit.BasicServicesKit';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    super.onCreate(want, launchParam);
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onCreate');

    AppStorage.setOrCreate("libHippy", libHippy)
    AppStorage.setOrCreate("abilityContext", this.context)

    let pageManagementItems:Object[] = []
    AppStorage.setOrCreate("pageManagementItems", pageManagementItems)
  }

  onDestroy() {
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage) {
    // Main window is created, set main page for this ability
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onWindowStageCreate');

    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        hilog.error(0x0000, 'DemoTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
        return;
      }
      hilog.info(0x0000, 'DemoTag', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');

      // 注册自定义字体
      let fontPath = this.context.resourceDir + '/fonts/TTTGB.otf'
      font.registerFont({
        familyName: 'TTTGB',
        familySrc: `file://${fontPath}`
      })
      hilog.info(0x0000, 'DemoTag', 'resources/resfile的绝对路径 : %{public}s', this.context.resourceDir);
      // this.context.resourceDir 的值是 '/data/storage/el1/bundle/entry/resources/resfile'
      // 把字体路径告知 C 层需要实现 HippyFontAdapter 的 getCustomFontPathMap 方法。
    });
  }

  onWindowStageDestroy() {
    // Main window is destroyed, release UI related resources
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onWindowStageDestroy');
  }

  onForeground() {
    // Ability has brought to foreground
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onForeground');
  }

  onBackground() {
    // Ability has back to background
    hilog.info(0x0000, 'DemoTag', '%{public}s', 'Ability onBackground');
  }
}
