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

export interface HippyImageRemoteLoaderListener {
  onRequestSuccess: (localPath: string) => void;
  onRequestFail: () => void;
}

/**
 * 对于业务需要自定义下载甚至解码的图片，可实现该adapter在图片准备好后返回本地路径。
 * 如果业务没有处理，可成功返回路径为原url。
 */
export interface HippyImageRemoteLoaderAdapter {
  /**
   * 根据图片url异步返回本地路径
   *
   * @param url 图片url
   * @listener 用来返回本地路径。
   *           本地路径举例："file:///data/storage/el1/bundle/entry/resources/resfile/demo.png"
   */
  fetchLocalPathAsync(url: string, listener: HippyImageRemoteLoaderListener): void;
}
