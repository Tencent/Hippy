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
      font.registerFont({
        familyName: 'TTTGB',
        familySrc: '/fonts/TTTGB.otf' // font文件与pages目录同级
      })
      hilog.info(0x0000, 'DemoTag', 'resources/resfile的绝对路径 : %{public}s', this.context.resourceDir);
      // todo :
      // this.context.resourceDir的值是'/data/storage/el1/bundle/entry/resources/resfile'
      // 把字体路径告知 c 层需要napi调用：
      // OhMeasureText::RegisterFont("TTTGB", this.context.resourceDir + "/fonts/TTTGB.otf")
      // 注意：TTTGB.otf 在 src/main/ets/fonts 和 src/main/resources/resfile/fonts 中各需一份拷贝，rawfile/fonts可以删除
      // 建议在 HippyEngine.ets的EngineInitParams 中加一个registerFont的方法，把上面ArkTS的字体注册也一起封装进去
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
