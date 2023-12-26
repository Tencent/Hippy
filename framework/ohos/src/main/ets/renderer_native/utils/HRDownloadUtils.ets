/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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

import request from '@ohos.request'
import { BusinessError } from '@ohos.base';
import fs from '@ohos.file.fs'

export class HRDownloadUtils{
  private cbProgress: Function = (receivedSize: number, totalSize: number) => {};
  private cbComplete: Function = () => {};
  private cbFail: Function = (err: number) => {};

  setCbProgress(cb: Function){
    this.cbProgress = cb
  }

  setCbComplete(cb: Function){
    this.cbComplete = cb
  }

  setCbFail(cb: Function){
    this.cbFail = cb
  }

  downloadTask(url: string,filePath: string) {
    fs.stat(filePath).then((stat: fs.Stat) => {
      fs.unlink(filePath).then(() => {
        console.info("remove file succeed");
      }).catch((err: BusinessError) => {
        console.error("remove file failed with error message: " + err.message + ", error code: " + err.code);
      });
    }).catch((err: BusinessError) => {
      console.info("HRImageView:getFileInfo failed with error:" + err);
    });

    let downloadTask: request.DownloadTask;
    try {
      request.downloadFile(getContext(), {
        url: url,
        filePath: filePath
      }, (err: BusinessError, data: request.DownloadTask) => {
        if (err) {
          console.error(`Failed to request the download. Code: ${err.code}, message: ${err.message}`);
          return;
        }
        downloadTask = data;
        downloadTask.on('fail', (err: number) => {
          console.error(`Failed to download the task. Code: ${err}`);
          this.cbFail(err);
        });

        downloadTask.on('complete', () => {
          this.cbComplete();
        });

        downloadTask.on('progress', (receivedSize: number, totalSize: number) => {
          this.cbProgress(receivedSize,totalSize);
        });
      });
    } catch (err) {
      console.error(`Failed to request the download. err: ${JSON.stringify(err)}`);
    }
  }
}
