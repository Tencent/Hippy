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
import fs from '@ohos.file.fs';

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

      // 情况一：注册非rawfile目录自定义字体
      //*
      let fontPath = `${getContext().resourceDir}/fonts/TTTGB.otf`;
      font.registerFont({
        familyName: 'TTTGB',
        familySrc: `file://${fontPath}`
      })
      // fontPath 的值是 '/data/storage/el1/bundle/entry/resources/resfile/fonts/TTTGB.otf'
      // 把字体路径告知 C 层需要实现 HippyFontAdapter 的 getCustomFontPathMap 方法。
      //*/

      // 情况二：注册rawfile目录自定义字体
      /*
      font.registerFont({
        familyName: 'TTTGB',
        familySrc: 'rawfile:font/TTTGB.otf'
      })
      // 鸿蒙提供的rawfile操作是一套非路径Api，无法获取文件路径，所以为了使用路径这里拷贝字体文件到一个临时目录
      const content = getContext().resourceManager.getRawFileContentSync("fonts/TTTGB.otf")
      const destPath = `${getContext().tempDir}/fonts/`;
      const fontPath = `${getContext().tempDir}/fonts/TTTGB.otf`;
      // fontPath 的值是 '/data/storage/el2/base/haps/entry/temp/fonts/TTTGB.otf'
      // 把字体路径告知 C 层需要实现 HippyFontAdapter 的 getCustomFontPathMap 方法。
      if (!fs.accessSync(destPath)) {
        fs.mkdirSync(destPath, true);
      }
      fs.open(fontPath, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE, (err: BusinessError, data) => {
        if (!err) {
          fs.write(data.fd, content.buffer, {offset: 0, length: content.length}).then((result) => {
            console.info(`copy file succeed:${result}`);
          })
          fs.close(data.fd);
        } else {
          console.error("copy file failed with error message: " + err.message + ", error code: " + err.code);
        }
      })
      //*/
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
