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
import { HippyFileAdapter } from './HippyFileAdapter';
import request from '@ohos.request';
import { HippyJsException } from '../../common/HippyJsException';
import { LogUtils } from '../../../support/utils/LogUtils';
import { ProcessorCallback } from '../../../vfs/ProcessorCallback';
import { ResourceDataHolder } from '../../../vfs/ResourceDataHolder';
import { FetchResultCode } from '../../HippyResourceLoader';
import fs from '@ohos.file.fs';
import { BusinessError } from '@kit.BasicServicesKit';

const FILE_REQ_TAG = "FileRequestAdapter"

export class FileRequestAdapter implements HippyFileAdapter {
  private ctx: Context;

  constructor(context: Context) {
    this.ctx = context;
  }

  public uploadFile(reqUrl: string, reqHaeder: object, reqMethod: string, reqFiles: request.File[], reqData: request.RequestData[]): Promise<request.UploadTask> {
    let uploadConfig: request.UploadConfig = {
      url: reqUrl,
      header: reqHaeder,
      method: reqMethod,
      files: reqFiles,
      data: reqData,
    };
    return new Promise<request.UploadTask>(() => {
      try {
        request.uploadFile(this.ctx, uploadConfig).then((data) => {
          LogUtils.i(FILE_REQ_TAG, 'succ to request the upload. result: ' + JSON.stringify(data));
          return data
        }).catch((err: HippyJsException) => {
          LogUtils.e(FILE_REQ_TAG, 'Failed to request the upload. Cause: ' + JSON.stringify(err));
        });
      } catch (err) {
        LogUtils.e(FILE_REQ_TAG, 'err.code : ' + err.code + ', err.message : ' + err.message);
      }
    })
  }

  public downloadFile(mDataHolder: ResourceDataHolder, mCallback: ProcessorCallback) {
    let filePath = this.ctx.filesDir + '/' + this.geFileName(mDataHolder.uri);

    try {
      let res = fs.accessSync(filePath);
      if (res) {
        let stat = fs.statSync(filePath);
        LogUtils.i(FILE_REQ_TAG, "get file info succeed, the size of file is " + stat.size);
        fs.unlinkSync(filePath);
      } else {
        LogUtils.i(FILE_REQ_TAG, "file not exists");
      }
    } catch (e) {
      LogUtils.e(FILE_REQ_TAG, `unlink file Failed. err: ${e}`);
  }

    let downloadTask: request.DownloadTask;
    try {
      request.downloadFile(this.ctx, {
        url: mDataHolder.uri,
        filePath: filePath
      }, (err: BusinessError, data: request.DownloadTask) => {
        LogUtils.i(FILE_REQ_TAG, 'Download task url:' + mDataHolder.uri);
        LogUtils.i(FILE_REQ_TAG, 'Download task filePath:' + filePath);
        if (err != undefined) {
          LogUtils.i(FILE_REQ_TAG, `Failed to request the download. Code: ${err.code}, message: ${err.message}`);
          return;
        }
        downloadTask = data;
        downloadTask.on('fail', (err: number) => {
          LogUtils.e(FILE_REQ_TAG, `Failed to download the task. Code: ${err}`);
          mDataHolder.errorMessage = err.toString()
          mCallback.onHandleCompleted();
        });

        downloadTask.on('complete', () => {
          LogUtils.i(FILE_REQ_TAG, 'Download task completed.');
          mDataHolder.resultCode = FetchResultCode.OK;
          mDataHolder.setBufferByFilePath(filePath);
          mCallback.onHandleCompleted();
        });

        downloadTask.on('progress', (receivedSize: number, totalSize: number) => {
          LogUtils.i(FILE_REQ_TAG, 'Download task receivedSize:' + receivedSize + ' totalSize:' + totalSize);
        });
      });
    } catch (e) {
      LogUtils.e(FILE_REQ_TAG, `Download task Failed. err: ${e}`);
    }
  }

  private geFileName(url: string): string {
    // 找到最后一个斜杠的位置
    const lastIndex = url.lastIndexOf('/');
    // 如果找到了斜杠，则截取斜杠之后的部分作为图片名
    if (lastIndex !== -1) {
      return url.slice(lastIndex + 1);
    }
    // 如果没有找到斜杠，则整个URL可能就是图片名
    return url;
  }
}
